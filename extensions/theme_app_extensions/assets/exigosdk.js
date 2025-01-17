/**
 * ExigoSDK - A JavaScript SDK for Exigo integration with Shopify
 * @version 1.0.0
 */

const ExigoSDK = (function() {
    // Private SDK variables
    let _instance = null;
    let _config = null;
    let _state = {
        isCustomer: false,
        customerId: 0,
        exigoId: 0,
        customerTypeId: 0,
        webalias: '',
        priceTypeWithCurrency: 1,
        referral: '',
        orderTotalNew: 0,
        pointsAvailable: 0
    };

    // Utility Managers
    const CookieManager = {
        get(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return '';
        },

        set(name, value, days = 30) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
        },

        delete(name) {
            this.set(name, '', -1);
        }
    };

    const UrlUtils = {
        getParameters() {
            const params = new URLSearchParams(window.location.search.toLowerCase());
            return Object.fromEntries(params.entries());
        },

        removeParameter(url, parameter) {
            if (!url) return url;
            const urlObj = new URL(url);
            urlObj.searchParams.delete(parameter);
            return urlObj.toString();
        },

        addParameter(url, param) {
            if (!url || url.startsWith('#')) return url;
            const urlObj = new URL(url, window.location.origin);
            const [key, value] = param.split('=');
            urlObj.searchParams.set(key, value);
            return urlObj.toString();
        }
    };

    // Core Managers
    const CartManager = {
        sdk: null,

        init(sdkInstance) {
            this.sdk = sdkInstance;
            return this;
        },

        async getCart() {
            try {
                const response = await fetch('/cart.js');
                return await response.json();
            } catch (error) {
                console.error('Error fetching cart:', error);
                return null;
            }
        },

        async updateAttributes(attributes) {
            try {
                await fetch('/cart/update.js', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ attributes })
                });
            } catch (error) {
                console.error('Error updating cart attributes:', error);
            }
        },

        async clear() {
            try {
                await fetch('/cart/clear.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                window.location.reload();
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        },

        async addItem(formData) {
            try {
                const response = await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                window.location = "/cart";
            } catch (error) {
                console.error('Error adding item to cart:', error);
            }
        }
    };

    const CustomerManager = {
        sdk: null,

        init(sdkInstance) {
            this.sdk = sdkInstance;
            return this;
        },

        async sync() {
            const state = this.sdk.getState();
            if (!state.isCustomer || state.exigoId > 0 || this.getSyncStatus()) return;

            const data = {
                Id: state.customerId,
                exigoId: -1,
                customerTypeId: state.customerTypeId,
                webalias: state.webalias,
                currentWebalias: CookieManager.get(this.sdk.getConfig().cookies.referral),
                currentReferral: state.referral,
                shopUrl: this.sdk.getConfig().urls.shop
            };

            try {
                const response = await this.apiCall('/api/context/CreateCustomer', data);
                console.log('Customer sync complete:', response);
                await this.refreshLoginToken();
            } catch (error) {
                console.error('Customer sync failed:', error);
            }
        },

        async syncData() {
            const state = this.sdk.getState();
            if (!state.isCustomer || state.exigoId <= 0) return;

            const data = {
                Id: state.customerId,
                exigoId: state.exigoId,
                customerTypeId: state.customerTypeId,
                webalias: state.webalias,
                currentWebalias: CookieManager.get(this.sdk.getConfig().cookies.referral),
                currentReferral: state.referral,
                shopUrl: this.sdk.getConfig().urls.shop
            };

            try {
                const response = await this.apiCall('/api/context/SyncCustomer', data);
                console.log('Customer data sync complete:', response);
                await this.refreshLoginToken();
            } catch (error) {
                console.error('Customer data sync failed:', error);
            }
        },

        async refreshLoginToken() {
            const state = this.sdk.getState();
            if (!state.isCustomer) {
                CookieManager.set(this.sdk.getConfig().cookies.login, '');
                return;
            }

            const data = {
                shopId: state.customerId,
                sharedKey: "api_87683768376873687gdhgd736g726e",
                shopUrl: this.sdk.getConfig().urls.shop
            };

            try {
                const token = await this.apiCall('/api/authentication/RefreshAdminLoginToken', data);
                CookieManager.set(this.sdk.getConfig().cookies.login, token);
                this.updateSilentLoginLinks(token);
            } catch (error) {
                console.error('Token refresh failed:', error);
            }
        },

        async apiCall(endpoint, data, method = 'POST') {
            const url = `${this.sdk.getConfig().api.url}${endpoint}`;
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);
            return await response.json();
        },

        getSyncStatus() {
            const state = this.sdk.getState();
            return CookieManager.get(this.sdk.getConfig().cookies.sync) === state.customerId.toString();
        },

        updateSilentLoginLinks(token) {
            const href = `${this.sdk.getConfig().urls.backoffice}/silentlogin?token=${token}`;
            document.querySelectorAll('.silentlogin').forEach(link => {
                link.href = href;
                link.style.display = 'block';
            });
        }
    };

    const PriceManager = {
        sdk: null,

        init(sdkInstance) {
            this.sdk = sdkInstance;
            return this;
        },

        async calculateCart() {
            const cart = await this.sdk.cart.getCart();
            if (!cart) return;

            let orderTotal = 0;
            const points = cart.attributes.points;
            if (points) orderTotal = -points;

            for (const item of cart.items) {
                if (!item.selling_plan_allocation) {
                    await this.setCartItemPrice(item);
                }
            }

            if (this.sdk.getConfig().defaults.priceType > 1) {
                document.querySelector('.additional-checkout-buttons')?.style.display = 'none';
                document.querySelector('#paypal-animation-container')?.style.display = 'none';
            }
        },

        async setCartItemPrice(item) {
            const state = this.sdk.getState();
            try {
                const response = await this.sdk.customer.apiCall(
                    `/api/context/calculateCartItem?pricetype=${state.priceTypeWithCurrency}&sku=${item.sku}&quantity=${item.quantity}&shopUrl=${this.sdk.getConfig().urls.shop}`
                );

                this.updatePriceElements(item.sku, response);
                this.updateOrderTotal(response.finalPrice);
            } catch (error) {
                console.error('Error calculating item price:', error);
            }
        },

        updatePriceElements(sku, priceData) {
            document.querySelector(`.exigo-price-${sku}`)?.innerHTML = `$${priceData.price}`;
            document.querySelector(`.exigo-cart-finalprice-${sku}`)?.innerHTML = `$${priceData.finalPrice.toFixed(2)}`;
            document.querySelector('.exigo-cart-total')?.innerHTML = `$${this.sdk.getState().orderTotalNew.toFixed(2)}`;
        },

        updateOrderTotal(amount) {
            const state = this.sdk.getState();
            state.orderTotalNew += amount;
            
            const pointsInput = document.querySelector('#exigo-pointstospend');
            if (pointsInput) {
                pointsInput.max = Math.min(state.pointsAvailable, state.orderTotalNew);
            }
        }
    };

    // Event System
    const EventSystem = {
        sdk: null,
        events: {
            INITIALIZED: 'exigo:initialized',
            CUSTOMER_SYNCED: 'exigo:customerSynced',
            CART_UPDATED: 'exigo:cartUpdated',
            PRICES_CALCULATED: 'exigo:pricesCalculated',
            CHECKOUT_STARTED: 'exigo:checkoutStarted',
            ERROR: 'exigo:error'
        },

        init(sdkInstance) {
            this.sdk = sdkInstance;
            return this;
        },

        dispatch(eventName, detail = {}) {
            const event = new CustomEvent(eventName, {
                detail: {
                    timestamp: new Date().getTime(),
                    ...detail
                },
                bubbles: true
            });
            document.dispatchEvent(event);
        },

        on(eventName, callback) {
            document.addEventListener(eventName, callback);
        },

        off(eventName, callback) {
            document.removeEventListener(eventName, callback);
        }
    };

    // UI Manager
    const UIManager = {
        sdk: null,

        init(sdkInstance) {
            this.sdk = sdkInstance;
            return this;
        },

        setupElements() {
            this.handleEnrollerSearch();
            this.handlePartyElements();
            this.handleCheckoutButtons();
            this.setupEventListeners();
        },

        handleEnrollerSearch() {
            const enrollerSearch = document.getElementById('cartEnrollerSearch');
            if (enrollerSearch) {
                enrollerSearch.style.display = 
                    this.sdk.getConfig().features.enableEnrollerSearch ? 'block' : 'none';
            }
        },

        handlePartyElements() {
            const partyElements = document.querySelectorAll('.party-element');
            partyElements.forEach(element => {
                element.style.display = this.sdk.getConfig().features.hasParty ? 'block' : 'none';
            });
        },

        handleCheckoutButtons() {
            if (this.sdk.getConfig().defaults.priceType > 1) {
                document.querySelectorAll('.additional-checkout-buttons').forEach(button => {
                    button.style.display = 'none';
                });
            }
        },

        setupEventListeners() {
            // Checkout form handler
            const cartForm = document.getElementById(this.sdk.getConfig().checkout.cartFormId);
            cartForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sdk.checkout.handleCheckout();
            });

            // Add to order buttons
            document.querySelectorAll('[data-role="add-to-order"]').forEach(button => {
                button.addEventListener('click', (e) => {
                    const orderType = document.getElementById('ordertype')?.value;
                    if (orderType === 'enrollmentpack') {
                        this.sdk.checkout.handleEnrollmentKit(button);
                    } else {
                        this.sdk.cart.addItem(new FormData(button.closest('form')));
                    }
                });
            });
        }
    };

    // Checkout Manager
    const CheckoutManager = {
        sdk: null,

        init(sdkInstance) {
            this.sdk = sdkInstance;
            return this;
        },

        async handleCheckout() {
            const cart = await this.sdk.cart.getCart();
            const hasPack = cart.items.some(item => 
                item.properties?.ordertype === 'enrollmentpack'
            );
            const hasSubscription = cart.items.some(item => 
                item.properties?.ordertype === 'autoorder'
            );

            this.sdk.events.dispatch(EventSystem.events.CHECKOUT_STARTED, {
                hasPack,
                hasSubscription
            });

            if (this.sdk.getConfig().checkout.useForEnrollment && hasPack) {
                await this.handleCustomCheckout();
            } else {
                window.location = '/checkout';
            }
        },

        async handleEnrollmentKit(button) {
            const cart = await this.sdk.cart.getCart();
            const hasPack = cart.items.some(item => 
                item.properties?.ordertype === 'enrollmentpack'
            );

            if (hasPack) {
                await this.sdk.cart.clear();
            }
            
            this.sdk.cart.addItem(new FormData(button.closest('form')));
        },

        async handleCustomCheckout() {
            // Implement custom checkout logic here
        }
    };

    // Main SDK Class
    class ExigoSDKClass {
        constructor(config = {}) {
            if (_instance) {
                return _instance;
            }

            _config = this.#initializeConfig(config);
            _instance = this;

            // Initialize managers
            this.cookies = CookieManager;
            this.urls = UrlUtils;
            this.cart = CartManager.init(this);
            this.customer = CustomerManager.init(this);
            this.prices = PriceManager.init(this);
            this.events = EventSystem.init(this);
            this.ui = UIManager.init(this);
            this.checkout = CheckoutManager.init(this);
        }

        #initializeConfig(userConfig) {
            return {
                api: {
                    url: userConfig.ApiUrl || '',
                    debugUrl: userConfig.DebugApiUrl || ''
                },
                urls: {
                    checkout: userConfig.CheckoutUrl || '',
                    debugCheckout: userConfig.DebugCheckoutUrl || '',
                    shop: userConfig.ShopUrl || '',
                    backoffice: userConfig.BackofficeUrl || '',
                    storePublic: userConfig.StorePublicUrl || '',
                    silentLogin: userConfig.SilentLoginUrl || ''
                },
                cookies: {
                    login: userConfig.LoginCookie || 'login',
                    sync: userConfig.SyncCookie || 'sync',
                    referral: userConfig.ReferralCookieName || "refid"
                },
                features: {
                    hasParty: userConfig.HasParty || false,
                    enableEnrollerSearch: userConfig.EnableEnrollerSearch || false,
                    useCheckout: userConfig.Checkout?.UseCheckout || false,
                    useEnrollment: userConfig.Enrollment?.Enable || false
                },
                defaults: {
                    webalias: userConfig.DefaultWebalias || "CorpOrphan",
                    referralParam: userConfig.ReferralParameter || "ref",
                    priceType: userConfig.PriceType || 1
                },
                checkout: {
                    cartFormId: userConfig.Checkout?.CartFormId || "cart",
                    clearCartByParameter: userConfig.Checkout?.ClearCartbyParameter || false,
                    hasClearCartPage: userConfig.Checkout?.HasClearCartShopifyPage || false,
                    restrictEnrollmentKits: userConfig.Checkout?.RestrictEnrollmentKits || false,
                    useForEnrollment: userConfig.Checkout?.UseCheckoutForEnrollment || false,
                    useForSubscriptions: userConfig.Checkout?.UseCheckoutForSubscriptions || false
                }
            };
        }

        async initialize() {
            if (!this.#shouldRunScript()) {
                console.log("%cExigo SDK not running, visiting proxy page", "color:red");
                this.events.dispatch(EventSystem.events.INITIALIZED, { success: false });
                return false;
            }

            try {
                await this.#setupEnvironment();
                await this.#initializeCustomer();
                await this.#initializeCart();
                
                this.events.dispatch(EventSystem.events.INITIALIZED, {
                    success: true,
                    state: this.getState(),
                    config: this.getConfig()
                });
                
                return true;
            } catch (error) {
                console.error('SDK Initialization error:', error);
                this.events.dispatch(EventSystem.events.ERROR, { error });
                return false;
            }
        }

        getState() {
            return { ..._state };
        }

        getConfig() {
            return { ..._config };
        }

        setState(newState) {
            _state = { ..._state, ...newState };
        }

        #shouldRunScript() {
            const url = window.location.href;
            return !url.includes("/tools/") && 
                   !url.includes("/apps/") && 
                   !url.includes("/a/") && 
                   !url.includes("/community/");
        }

        async #setupEnvironment() {
            const params = this.urls.getParameters();
            _state.referral = params[_config.defaults.referralParam] || '';
            
            if (_state.referral) {
                this.cookies.set(_config.cookies.referral, _state.referral);
            }

            // Set customer state from Shopify customer object
            const shopifyCustomer = window.shopifyCustomer || {};
            _state.isCustomer = !!shopifyCustomer;
            
            if (_state.isCustomer) {
                _state.customerId = shopifyCustomer.id || 0;
                _state.exigoId = shopifyCustomer.metafields?.exigo?.customer_id || 0;
                _state.customerTypeId = shopifyCustomer.metafields?.exigo?.customer_type_id || 0;
                _state.webalias = shopifyCustomer.metafields?.exigo?.webalias || '';
                _state.pointsAvailable = shopifyCustomer.metafields?.exigo?.points || 0;
            }

            const currency = window.Shopify?.currency?.active || 'USD';
            _state.priceTypeWithCurrency = `${_config.defaults.priceType}_${currency}`;

            // Add missing initialization functions from ExigoScript.js
            await this.#setDebugCookie();
            await this.#setDebug();
            await this.#setReferralCookie();
            await this.#setEnroller();
            await this.#addReferralToUrl();
            await this.#insertNotesCreateCustomerForm();
            await this.#insertNotesLoginForm();
            await this.#setEnrollerSearchLogic();
            await this.#setEnrollerSearch();

            if (_config.features.useEnrollment) {
                await this.#handleEnrollment();
            }

            if (_config.features.enableEnrollerSearch) {
                await this.#setEnrollerSearch();
            }

            if (_config.features.useCheckout) {
                await this.#setCheckoutEventListeners();
                await this.#clearCartLogic();
            }

            // Initialize UI
            this.ui.setupElements();
        }

        async #initializeCustomer() {
            if (_state.isCustomer) {
                await this.customer.sync();
                await this.customer.syncData();
            }
        }

        async #initializeCart() {
            await this.prices.calculateCart();
        }

        #setDebugCookie() {
            const debugParam = this.urls.getParameters().debug;
            if (debugParam === "1") {
                this.cookies.set("debugsession", "1");
            } else if (debugParam === "0") {
                this.cookies.set("debugsession", "0");
            }
        }

        #setDebug() {
            const isDebug = this.cookies.get("debugsession");
            if (isDebug === "1") {
                _config.api.url = _config.api.debugUrl;
                _config.urls.checkout = _config.urls.debugCheckout;
                document.getElementById("devbox")?.show();
            }
        }

        #setReferralCookie() {
            const referral = this.cookies.get(_config.cookies.referral);
            if (!referral || referral === _config.defaults.webalias) {
                this.cookies.set(_config.cookies.referral, _config.defaults.webalias);
            }
        }

        #setEnroller() {
            const urlReferral = this.urls.getParameters()[_config.defaults.referralParam];
            if (urlReferral) {
                this.cookies.set(_config.cookies.referral, urlReferral.toLowerCase());
            }
        }

        #addReferralToUrl() {
            const referral = this.cookies.get(_config.cookies.referral);
            if (referral && referral !== _config.defaults.webalias) {
                document.querySelectorAll('a').forEach(link => {
                    if (link.href && !link.href.includes(_config.defaults.referralParam)) {
                        link.href = this.urls.addParameter(link.href, `${_config.defaults.referralParam}=${referral}`);
                    }
                });
            }
        }

        #insertNotesCreateCustomerForm() {
            // Implementation of insertNotesCreateCustomerForm
        }

        #insertNotesLoginForm() {
            // Implementation of insertNotesLoginForm
        }

        #setEnrollerSearchLogic() {
            // Implementation of setEnrollerSearchLogic
        }

        #setEnrollerSearch() {
            // Implementation of setEnrollerSearch
        }

        #handleEnrollment() {
            // Implementation of handleEnrollment
        }

        #setCheckoutEventListeners() {
            // Implementation of setCheckoutEventListeners
        }

        #clearCartLogic() {
            // Implementation of clearCartLogic
        }
    }

    // Return the SDK constructor
    return {
        init: function(config) {
            return new ExigoSDKClass(config);
        }
    };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExigoSDK;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return ExigoSDK; });
} else {
    window.ExigoSDK = ExigoSDK;
} 