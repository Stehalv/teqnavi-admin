import { PageBuilder } from "~/features/pagebuilder/components/PageBuilder.js";
import type { Page } from "~/features/pagebuilder/types.js";

const testPage: Page = {
  id: "test",
  shopId: "test-shop",
  title: "Test Page",
  handle: "test-page",
  template: "page",
  sections: {
    "section1": {
      id: "section1",
      type: "hero",
      settings: {
        heading: "Welcome to our store",
        subheading: "Shop the latest trends",
        button_text: "Shop Now",
        button_link: "/collections/all",
        background_color: "#000000",
        text_color: "#ffffff"
      },
      blocks: {},
      block_order: []
    },
    "section2": {
      id: "section2",
      type: "featured-collection",
      settings: {
        title: "Featured Products",
        collection: "frontpage",
        products_to_show: 4,
        show_view_all: true
      },
      blocks: {},
      block_order: []
    }
  },
  section_order: ["section1", "section2"],
  settings: {
    layout: "full-width",
    spacing: 0,
    background: {
      type: "color",
      value: "#ffffff"
    },
    seo: {
      title: "Test Page",
      description: "This is a test page",
      url_handle: "test-page"
    }
  },
  isPublished: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

export default function PageBuilderIndex() {
  return (
    <PageBuilder 
      initialPage={testPage}
      onSave={async (page) => {
        console.log("Saving page:", page);
      }}
    />
  );
} 