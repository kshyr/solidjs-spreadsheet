import { Component, createSignal } from "solid-js";
import { createMemo, For, createEffect } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { createVirtualizer } from "@tanstack/solid-virtual";

// grid size (n x n)

type CellValue = string | null;

type Cell = {
  id: string;
  value: CellValue;
};

const Cell: Component = () => {
  return <div></div>;
};

type GridProps = {
  n: number;
};

const Grid: Component = () => {
  const rowCount = 100;
  const colCount = 26;
  let parentRef: HTMLDivElement | undefined;

  const letters = createMemo(() => {
    return Array.from(Array(colCount)).map((_, i) =>
      String.fromCharCode(i + 65)
    );
  });

  const initCells = Array.from(Array(rowCount), (_, row) =>
    Array.from(
      Array(colCount),
      (_, col) =>
      ({
        id: String.fromCharCode(65 + row) + (col + 1),
        value: null,
      } as Cell)
    )
  );

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

  const [cells, setCells] = createStore<Cell[][]>(initCells);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleBlur = (e, row: number, col: number) => {
    e.target.scrollLeft = 0;
    const updateValue = e.target.textContent;
    e.target.textContent = renderCellValue(cells[row][col]?.value);

    updateCell(row, col, updateValue);
  };

  const updateCell = (row: number, col: number, value: CellValue) => {
    setCells(
      produce((cell) => {
        cell[row][col].value = value;
      })
    );
  };

  const renderCellValue = (value: CellValue) => {
    if (!value) return "";
    let renderValue: string;

    if (value.startsWith("=") && value.trim().length > 2) {
      let referencing = true;
      let referencedValue = value;

      while (referencing) {
        const cellId = referencedValue.split("=")[1];
        const row = parseInt(cellId.charAt(1)) - 1;
        const col = parseInt(
          (cellId.toLowerCase().charCodeAt(0) - 97).toString()
        );

        renderValue = cells[row][col].value;
        if (!renderValue.startsWith("=")) {
          referencing = false;
        } else {
          referencedValue = renderValue;
        }
      }
    } else {
      renderValue = value;
    }

    return renderValue;
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
                  onblur={(e) => {
                    handleBlur(e, virtualRow.index, virtualColumn.index);
                  }}
                  onkeydown={(e) => handleEnter(e)}
                  onfocus={(e) =>
                  (e.target.textContent =
                    cells[virtualRow.index][virtualColumn.index]?.value)
                  }
                  class="absolute top-0 left-0 pl-1 border flex items-center overflow-auto whitespace-nowrap"
                  style={{
                    height: `${virtualRow.size}px`,
                    width: `${virtualColumn.size}px`,
                    transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                  }}
                >
                  {renderCellValue(
                    cells[virtualRow.index][virtualColumn.index]?.value
                  )}
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
          <div class="bg-base-200 rounded-xl h-full p-4">
            <Grid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
