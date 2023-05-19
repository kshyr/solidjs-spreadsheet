import { Component, createSignal } from "solid-js";
import { createMemo, For, createEffect } from "solid-js";
import { createStore } from "solid-js/store";

// grid size (n x n)
const [n, setN] = createSignal(6);

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
  const letters = createMemo(() => {
    return Array.from(Array(n() ** 2)).map((_, i) =>
      String.fromCharCode(i + 65)
    );
  });

  createEffect(() => {
    const gridContainer = document.getElementById("dynamic-grid");
    gridContainer.style.setProperty("--num-rows", n.toString());
    gridContainer.style.setProperty("--num-columns", n().toString());
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

  return (
    <div class="h-full w-full" id="dynamic-grid">
      <For each={letters()}>{(letter) => <div>{letter}</div>}</For>
    </div>
  );
};

const App: Component = () => {
  return (
    <div class="  h-screen flex justify-center items-center ">
      <div class="mockup-window bg-base-300 w-3/5 h-1/2">
        <div class="px-2 pb-9 h-full">
          <div class="bg-base-200 rounded-xl h-full p-8">
            <Grid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
