import { PromptEditor } from '../PromptEditor';

export default function PromptEditorExample() {
  return (
    <div className="p-4">
      <PromptEditor
        initialBody="Classify the product: {{product_name}}"
        initialVariables={[{ key: "product_name", defaultValue: "" }]}
      />
    </div>
  );
}
