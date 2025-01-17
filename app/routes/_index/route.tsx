import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "~/shopify.server.js";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Teqnavi Shopify App</h1>
        <p className={styles.text}>
          Enhance your Shopify store with Teqnavi's powerful features and tools.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Easy Integration</strong>. Seamlessly integrate Teqnavi with your Shopify store.
          </li>
          <li>
            <strong>Powerful Tools</strong>. Access our suite of advanced features to enhance your store.
          </li>
          <li>
            <strong>Expert Support</strong>. Get dedicated support from our team of experts.
          </li>
        </ul>
      </div>
    </div>
  );
}
