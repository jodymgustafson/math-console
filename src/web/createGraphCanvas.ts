import { CartesianGraph, GraphCanvas, PolarGraph } from "math-graph-canvas/dist";
import { Graph, GraphType } from "math-graph-canvas/dist/src/graphs/graph";
import { create, all, EvalFunction } from "mathjs";

const DEFAULT_GRAPH_SIZE = "200";

const COLORS = ["#ff0000", "#00aa00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

const math = create(all, {});
export const parser = math.parser();

export function createGraphCanvas(graphType: GraphType, ...expr: string[]): GraphCanvas {
    const start = Date.now();
    const gc = document.createElement("graph-canvas") as GraphCanvas;
    gc.setAttribute("width", DEFAULT_GRAPH_SIZE);
    gc.setAttribute("height", DEFAULT_GRAPH_SIZE);

    expr.forEach((e, i) => {
        const fn = tryCompileFunction(graphType, e);
        const g = createGraph(graphType, e, fn);
        g.settings.color = COLORS[i % COLORS.length];
        gc.addGraph(g);
    });
    console.log("time", Date.now() - start);

    return gc;
}

function tryCompileFunction(graphType: GraphType, e: string): EvalFunction {
    switch (graphType) {
        case "cartesian":
            parser.set("x", 0); break;
        case "polar":
            parser.set("t", 0); break;
    }

    const fn = math.compile(e);
    fn.evaluate(parser.getAll()) as number;
    return fn;
}

function createGraph(graphType: GraphType, name: string, fnCall: EvalFunction): Graph {
    switch (graphType) {
        case "cartesian":
            return new CartesianGraph(name, (x) => {
                parser.set("x", x);
                const value = fnCall.evaluate(parser.getAll()) as number;
                return value;
            });
        case "polar":
            return new PolarGraph(name, (t) => {
                parser.set("t", t);
                const value = fnCall.evaluate(parser.getAll()) as number;
                return value;
            });
    }

    throw new Error("Invalid graph type: " + graphType);
}
