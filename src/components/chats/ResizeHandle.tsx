import { Separator } from "react-resizable-panels";

const ResizeHandle = () => (
  <Separator className="w-1 relative flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 transition-colors group cursor-col-resize z-40">
    <div className="h-8 w-[2px] bg-zinc-300 rounded-full group-hover:bg-zinc-400 transition-colors" />
  </Separator>
);

export default ResizeHandle;