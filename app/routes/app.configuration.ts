import { authenticate } from "../shopify.server.js";
import { json } from "@remix-run/node";

export async function action({ request }: { request: Request }) {
  const { admin } = await authenticate.admin(request);

  // Get shop ID using GraphQL
  const response = await admin.graphql(`
    query {
      shop {
        id
      }
    }
  `);
  const { data: { shop } } = await response.json();

  const formData = await request.formData();
  const metafields = [
    {
      namespace: "exigo",
      key: "api_url",
      value: "https://your-api-url.com",
      type: "single_line_text_field"
    },
    {
      namespace: "exigo",
      key: "default_webalias",
      value: "default",
      type: "single_line_text_field"
    },
    {
      namespace: "exigo",
      key: "backoffice_url",
      value: "https://your-backoffice-url.com",
      type: "single_line_text_field"
    },
    {
      namespace: "exigo",
      key: "price_type",
      value: "1",
      type: "number_integer"
    },
    {
      namespace: "exigo",
      key: "has_party",
      value: "false",
      type: "boolean"
    },
    {
      namespace: "exigo",
      key: "enable_enroller_search",
      value: "true",
      type: "boolean"
    }
  ];

  for (const metafield of metafields) {
    await admin.graphql(
      `mutation CreateMetafield($input: MetafieldsSetInput!) {
        metafieldsSet(metafields: $input) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: {
            namespace: metafield.namespace,
            key: metafield.key,
            value: metafield.value,
            type: metafield.type,
            ownerId: shop.id
          }
        }
      }
    );
  }

  return json({ success: true });
} 