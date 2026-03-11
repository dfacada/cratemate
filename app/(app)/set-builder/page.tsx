import SetBuilder from "@/components/set-builder";

export default function SetBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Set Builder</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Arrange your crate into a structured DJ set with AI-assisted arc building
        </p>
      </div>
      <SetBuilder />
    </div>
  );
}
