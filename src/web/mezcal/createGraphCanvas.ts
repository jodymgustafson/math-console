import { CartesianGraph, GraphCanvas, PolarGraph } from "math-graph-canvas/dist";
import { Graph, GraphType } from "math-graph-canvas/dist/src/graphs/graph";
import { MezcalRuntimeError, Runtime } from "mezcal/dist/src/runtime";

const DEFAULT_GRAPH_SIZE = "200";

const COLORS = ["#ff0000", "#00aa00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

export const runtime = new Runtime();

export function createGraphCanvas(graphType: GraphType, ...expr: string[]): GraphCanvas {
    const start = Date.now();
        const gc = document.createElement("graph-canvas") as GraphCanvas;
        gc.setAttribute("width", DEFAULT_GRAPH_SIZE);
        gc.setAttribute("height", DEFAULT_GRAPH_SIZE);

        expr.forEach((e, i) => {
            const fn = `function _fn${i}() return ${e}`;
            // console.log(fn);
            runtime.evaluate(fn);
            const g = createGraph(graphType, e, `_fn${i}()`);
            g.settings.color = COLORS[i];
            gc.addGraph(g);
        });
    console.log("time", Date.now() - start);

    return gc;
}

function createGraph(graphType: GraphType, name: string, fnCall: string): Graph {
    switch (graphType) {
        case "cartesian":
            return new CartesianGraph(name, (x) => {
                runtime.interpreter.globals.setVariable("x", x);
                const value = runtime.evaluate(fnCall) as number;
                return value;
            });
        case "polar":
            return new PolarGraph(name, (t) => {
                runtime.interpreter.globals.setVariable("t", t);
                const value = runtime.evaluate(fnCall) as number;
                return value;
            });
    }

    throw new Error("Invalid graph type: " + graphType);
}
