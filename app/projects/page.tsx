import EditorContainer from "@/components/editor/editor-container";
import LatexRenderer from "@/components/latex-render/latex";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import SideNav from "@/components/nav/side-nav"
export const maxDuration = 30;

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={15} minSize={10} collapsible={true}>
          <SideNav />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={40}>
          <EditorContainer />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={40}>
          <LatexRenderer />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
