import { createFileRoute } from "@tanstack/react-router";
import { CVProvider, useCV, emptyCV } from "@/lib/cv-store";
import { CVEditor } from "@/components/cv/CVEditor";
import { CVPreview } from "@/components/cv/CVPreview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ui } from "@/lib/cv-i18n";
import { Download, Printer, Save, Upload, FileJson, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import type { CVData } from "@/lib/cv-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Criador de Currículo — CV profissional em minutos" },
      {
        name: "description",
        content:
          "Monte um currículo profissional elegante em minutos. Preview em tempo real, temas premium, exportação em PDF e suporte a múltiplos idiomas.",
      },
      { property: "og:title", content: "Criador de Currículo" },
      {
        property: "og:description",
        content:
          "Preview em tempo real, temas premium, exportação em PDF. Português, Español e English.",
      },
    ],
  }),
  component: () => (
    <CVProvider>
      <Toaster richColors position="top-center" />
      <Page />
    </CVProvider>
  ),
});

function Page() {
  const { data, replace } = useCV();
  const L = ui[data.lang];
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"editor" | "preview">("editor");

  const doPrint = () => window.print();

  const doExportPdf = async () => {
    window.print();
  };

  const doDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImportJson = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result)) as CVData;
        replace({ ...emptyCV(), ...parsed });
        toast.success("Import OK");
      } catch {
        toast.error("JSON inválido");
      }
    };
    r.readAsText(f);
  };

  const doSave = () => toast.success(L.saved);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="print:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">
              CV
            </div>
            <div className="font-semibold truncate">{L.appTitle}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={doSave}>
              <Save className="w-4 h-4 mr-1" /> {L.save}
            </Button>
            <Button variant="outline" size="sm" onClick={doDownloadJson}>
              <FileJson className="w-4 h-4 mr-1" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1" /> {L.importJson}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => doImportJson(e.target.files?.[0])}
            />
            <Button variant="outline" size="sm" onClick={doPrint}>
              <Printer className="w-4 h-4 mr-1" /> {L.print}
            </Button>
            <Button size="sm" onClick={doExportPdf}>
              <Download className="w-4 h-4 mr-1" /> {L.exportPdf}
            </Button>
          </div>
        </div>
      </header>

      {/* Content — split view desktop, tabs mobile */}
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        {/* Mobile / tablet tabs */}
        <div className="lg:hidden print:hidden">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "editor" | "preview")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="editor">
                <FileText className="w-4 h-4 mr-1" /> {L.editor}
              </TabsTrigger>
              <TabsTrigger value="preview">{L.preview}</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-3">
              <CVEditor />
            </TabsContent>
            <TabsContent value="preview" className="mt-3">
              <PreviewFrame />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop split */}
        <div className="hidden lg:grid grid-cols-[minmax(0,480px)_minmax(0,1fr)] gap-6 print:block">
          <div className="print:hidden">
            <div className="max-h-[calc(100vh-88px)] overflow-y-auto pr-1">
              <CVEditor />
            </div>
          </div>
          <div>
            <PreviewFrame />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewFrame() {
  const { data } = useCV();
  return (
    <div className="print:contents">
      <div className="mx-auto shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none bg-white cv-frame">
        <CVPreview data={data} />
      </div>
    </div>
  );
}
