import { Component, createSignal } from "solid-js";
import { createMemo, For, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { createVirtualizer } from "@tanstack/solid-virtual";

// grid size (n x n)

type Cell = {
  id: string;
  value?: string | number;
};

const Cell: Component = () => {
  return <div></div>;
};

type GridProps = {
  n: number;
};

const Grid: Component = () => {
  const rowCount = 10000;
  const colCount = 26;
  let parentRef: HTMLDivElement | undefined;

  const letters = createMemo(() => {
    return Array.from(Array(colCount)).map((_, i) =>
      String.fromCharCode(i + 65)
    );
  });

  const rowVirtualizer = createVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef,
    estimateSize: () => 40,
    overscan: 10,
  });

  const columnVirtualizer = createVirtualizer({
    horizontal: true,
    count: colCount,
    getScrollElement: () => parentRef,
    estimateSize: () => 100,
  });

  const [cells, setCells] = createStore<Cell[]>([
    {
      id: "A1",
      value: 32,
    },
    {
      id: "A2",
      value: 64,
    },
  ]);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div ref={parentRef} class="h-full w-full overflow-auto">
      <div
        class="relative"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: `${columnVirtualizer.getTotalSize()}px`,
        }}
      >
        <For each={rowVirtualizer.getVirtualItems()}>
          {(virtualRow) => (
            <For each={columnVirtualizer.getVirtualItems()}>
              {(virtualColumn) => (
                <div
                  contenteditable
                  onblur={(e) => (e.target.scrollLeft = 0)}
                  onkeydown={(e) => handleEnter(e)}
                  class="absolute top-0 left-0 pl-1 border flex items-center overflow-auto whitespace-nowrap"
                  style={{
                    height: `${virtualRow.size}px`,
                    width: `${virtualColumn.size}px`,
                    transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                  }}
                >
                  {letters()[virtualColumn.index]}
                  {virtualRow.index + 1}
                </div>
              )}
            </For>
          )}
        </For>
      </div>
    </div>
  );
};

const App: Component = () => {
  return (
    <div class="h-screen flex justify-center items-center ">
      <div class="mockup-window bg-base-300 w-3/5 h-1/2">
        <div class="px-2 pb-9 h-full">
          <div class="bg-base-200 rounded-xl h-full">
            <Grid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
