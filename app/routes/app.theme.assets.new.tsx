import { json, redirect, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Page, Layout, LegacyCard, FormLayout, TextField, Button, Banner } from "@shopify/polaris";
import { authenticate } from "~/shopify.server.js";
import { prisma } from "~/db.server.js";
import { useState } from "react";
import { validateBlock } from "~/features/theme/utils/validateBlock.js";
import { validateShopAccess } from "~/middleware/auth.server.js";

const DEFAULT_CONTENT = {
  section: `{% schema %}
{
  "name": "Custom Section",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Welcome"
    },
    {
      "type": "richtext",
      "id": "content",
      "label": "Content",
      "default": "<p>Add your content here</p>"
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Padding Top",
      "default": 36,
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px"
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Padding Bottom",
      "default": 36,
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px"
    }
  ],
  "blocks": [
    {
      "type": "text",
      "name": "Text Block",
      "settings": [
        {
          "type": "text",
          "id": "heading",
          "label": "Heading",
          "default": "Heading"
        },
        {
          "type": "richtext",
          "id": "text",
          "label": "Text",
          "default": "<p>Share your story</p>"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Custom Section",
      "settings": {
        "title": "Welcome",
        "content": "<p>Add your content here</p>",
        "padding_top": 36,
        "padding_bottom": 36
      }
    }
  ]
}
{% endschema %}

<div class="section" style="padding-top: {{ section.settings.padding_top }}px; padding-bottom: {{ section.settings.padding_bottom }}px;">
  <div class="page-width">
    <h2>{{ section.settings.title }}</h2>
    <div>{{ section.settings.content }}</div>
    
    {% for block in section.blocks %}
      {% case block.type %}
        {% when 'text' %}
          <div {{ block.shopify_attributes }}>
            <h3>{{ block.settings.heading }}</h3>
            <div>{{ block.settings.text }}</div>
          </div>
      {% endcase %}
    {% endfor %}
  </div>
</div>`,

  snippet: `{% comment %}
  Usage:
  {% render 'snippet-name', title: 'My Title', content: 'My Content' %}
{% endcomment %}

<div class="snippet-container">
  {% if title %}
    <h2>{{ title }}</h2>
  {% endif %}
  
  <div class="snippet-content">
    {{ content }}
  </div>
</div>`,

  page: JSON.stringify({
    sections: {
      main: {
        type: "main-page",
        settings: {
          padding_top: 36,
          padding_bottom: 36
        }
      }
    },
    order: ["main"]
  }, null, 2),

  asset: `/* Asset content here */`,

  block: `{% schema %}
{
  "name": "Custom Block",
  "target": "section",
  "templates": ["product", "collection", "page"],
  "type": "{{ type }}",
  "settings": [
    {
      "type": "select",
      "id": "block_type",
      "label": "Block Type",
      "options": [
        {
          "value": "text",
          "label": "Text Block"
        },
        {
          "value": "image",
          "label": "Image Block"
        },
        {
          "value": "product",
          "label": "Product Block"
        },
        {
          "value": "collection",
          "label": "Collection Block"
        }
      ],
      "default": "text"
    },
    {
      "type": "header",
      "content": "Text Settings"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Block Heading",
      "info": "Only used for text blocks"
    },
    {
      "type": "richtext",
      "id": "text",
      "label": "Text Content",
      "default": "<p>Block content goes here</p>",
      "info": "Only used for text blocks"
    },
    {
      "type": "header",
      "content": "Image Settings"
    },
    {
      "type": "image_picker",
      "id": "image",
      "label": "Image",
      "info": "Only used for image blocks"
    },
    {
      "type": "text",
      "id": "image_alt",
      "label": "Image Alt Text",
      "default": "",
      "info": "Only used for image blocks"
    },
    {
      "type": "select",
      "id": "image_size",
      "label": "Image Size",
      "options": [
        {
          "value": "small",
          "label": "Small"
        },
        {
          "value": "medium",
          "label": "Medium"
        },
        {
          "value": "large",
          "label": "Large"
        }
      ],
      "default": "medium",
      "info": "Only used for image blocks"
    },
    {
      "type": "header",
      "content": "Product Settings"
    },
    {
      "type": "product",
      "id": "product",
      "label": "Product",
      "info": "Only used for product blocks"
    },
    {
      "type": "checkbox",
      "id": "show_price",
      "label": "Show Price",
      "default": true,
      "info": "Only used for product blocks"
    },
    {
      "type": "checkbox",
      "id": "show_vendor",
      "label": "Show Vendor",
      "default": true,
      "info": "Only used for product blocks"
    },
    {
      "type": "header",
      "content": "Collection Settings"
    },
    {
      "type": "collection",
      "id": "collection",
      "label": "Collection",
      "info": "Only used for collection blocks"
    },
    {
      "type": "range",
      "id": "products_to_show",
      "min": 2,
      "max": 12,
      "step": 2,
      "default": 4,
      "label": "Products to Show",
      "info": "Only used for collection blocks"
    },
    {
      "type": "header",
      "content": "Layout Settings"
    },
    {
      "type": "select",
      "id": "width",
      "label": "Block Width",
      "options": [
        {
          "value": "small",
          "label": "Small"
        },
        {
          "value": "medium",
          "label": "Medium"
        },
        {
          "value": "large",
          "label": "Large"
        },
        {
          "value": "full",
          "label": "Full Width"
        }
      ],
      "default": "medium"
    },
    {
      "type": "range",
      "id": "padding",
      "min": 0,
      "max": 40,
      "step": 4,
      "unit": "px",
      "label": "Padding",
      "default": 16
    }
  ]
}
{% endschema %}

<div class="block-content block-{{ block.settings.block_type }} block-width-{{ block.settings.width }}" style="padding: {{ block.settings.padding }}px;">
  {% case block.settings.block_type %}
    {% when 'text' %}
      <h3>{{ block.settings.heading }}</h3>
      <div>{{ block.settings.text }}</div>

    {% when 'image' %}
      {% if block.settings.image %}
        <img 
          src="{{ block.settings.image | image_url: block.settings.image_size }}"
          alt="{{ block.settings.image_alt | escape }}"
          class="image-{{ block.settings.image_size }}"
          loading="lazy"
          width="{{ block.settings.image.width }}"
          height="{{ block.settings.image.height }}"
        >
      {% endif %}

    {% when 'product' %}
      {% if block.settings.product %}
        <div class="product-block">
          <img 
            src="{{ block.settings.product.featured_image | image_url: 'medium' }}"
            alt="{{ block.settings.product.title | escape }}"
            loading="lazy"
          >
          <h3>{{ block.settings.product.title }}</h3>
          {% if block.settings.show_vendor %}
            <p class="vendor">{{ block.settings.product.vendor }}</p>
          {% endif %}
          {% if block.settings.show_price %}
            <p class="price">{{ block.settings.product.price | money }}</p>
          {% endif %}
        </div>
      {% endif %}

    {% when 'collection' %}
      {% if block.settings.collection %}
        <div class="collection-block">
          <h3>{{ block.settings.collection.title }}</h3>
          <div class="products-grid">
            {% for product in block.settings.collection.products limit: block.settings.products_to_show %}
              <div class="product-card">
                <img 
                  src="{{ product.featured_image | image_url: 'medium' }}"
                  alt="{{ product.title | escape }}"
                  loading="lazy"
                >
                <h4>{{ product.title }}</h4>
                <p class="price">{{ product.price | money }}</p>
              </div>
            {% endfor %}
          </div>
        </div>
      {% endif %}
  {% endcase %}
</div>

<style>
  .block-content {
    margin: 0 auto;
  }
  .block-width-small {
    max-width: 400px;
  }
  .block-width-medium {
    max-width: 800px;
  }
  .block-width-large {
    max-width: 1200px;
  }
  .block-width-full {
    width: 100%;
  }
  .image-small {
    max-width: 200px;
  }
  .image-medium {
    max-width: 400px;
  }
  .image-large {
    max-width: 800px;
  }
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  .product-card {
    text-align: center;
  }
  .product-card img {
    width: 100%;
    height: auto;
  }
</style>`
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'section';
  const errors = url.searchParams.get('errors');

  return json({ 
    type, 
    defaultContent: DEFAULT_CONTENT[type as keyof typeof DEFAULT_CONTENT],
    errors: errors ? JSON.parse(errors) : []
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { shopId } = await validateShopAccess(request);
    const formData = await request.formData();
    const url = new URL(request.url);
    const host = url.searchParams.get("host")!;

    const name = formData.get('name');
    const type = formData.get('type');

    if (!name || typeof name !== 'string') {
      return json({ error: 'Name is required' }, { status: 400 });
    }

    if (!type || typeof type !== 'string') {
      return json({ error: 'Type is required' }, { status: 400 });
    }

    if (!['page', 'section', 'block', 'snippet', 'asset'].includes(type)) {
      return json({ error: 'Invalid asset type' }, { status: 400 });
    }

    const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if handle already exists for this shop
    const existingAsset = await prisma.themeAsset.findFirst({
      where: {
        handle,
        shopId,
        type
      }
    });

    if (existingAsset) {
      return json({ error: `An asset with this name already exists` }, { status: 400 });
    }

    const asset = await prisma.themeAsset.create({
      data: {
        shopId,
        type,
        name,
        handle,
        content: DEFAULT_CONTENT[type as keyof typeof DEFAULT_CONTENT] || '',
        settings: '{}',
        template_format: 'liquid',
        isActive: false
      }
    });

    return redirect(`/app/theme/assets?host=${host}`);
  } catch (error) {
    console.error('Error creating asset:', error);
    return json({ error: 'Failed to create asset' }, { status: 500 });
  }
};

async function generateUniqueHandle(baseHandle: string, request: Request) {
  const { shopId } = await validateShopAccess(request);
  let handle = baseHandle;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.themeAsset.findUnique({
      where: { 
        shopHandle: {
          shopId,
          handle
        }
      }
    });

    if (!existing) return handle;
    handle = `${baseHandle}-${counter++}`;
  }
}

export default function NewAssetPage() {
  const { type, defaultContent, errors: initialErrors } = useLoaderData<typeof loader>();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [errors, setErrors] = useState<any[]>(initialErrors);
  const submit = useSubmit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('type', type);
    formData.append('name', name);
    if (type === 'page' && handle) {
      formData.append('handle', handle);
    }

    submit(formData, { 
      method: 'POST',
      replace: true
    });
  };

  return (
    <Page title={`New ${type}`}>
      <Layout>
        <Layout.Section>
          {errors.length > 0 && (
            <Banner tone="critical">
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </Banner>
          )}
          <form onSubmit={handleSubmit}>
            <LegacyCard>
              <LegacyCard.Section>
                <FormLayout>
                  <TextField
                    label="Name"
                    value={name}
                    onChange={setName}
                    autoComplete="off"
                    error={errors.find(e => e.field === 'name')?.message}
                  />
                  {type === 'page' && (
                    <TextField
                      label="URL Handle"
                      value={handle}
                      onChange={setHandle}
                      helpText="Will be accessible at /a/pages/your-handle"
                      autoComplete="off"
                      error={errors.find(e => e.field === 'handle')?.message}
                    />
                  )}
                  <Button submit>Create</Button>
                </FormLayout>
              </LegacyCard.Section>
            </LegacyCard>
          </form>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 