import { CartesianGraph, GraphCanvas, PolarGraph } from "math-graph-canvas/dist";
import { Graph, GraphType } from "math-graph-canvas/dist/src/graphs/graph";
import { MezcalRuntimeError, Runtime } from "mezcal/dist/src/runtime";
// import data from "../../data/version.json";
// import pkg from "../../package.json";

const DEFAULT_GRAPH_SIZE = "200";

const COLORS = ["#ff0000", "#00aa00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

const runtime = new Runtime();

const mode = document.getElementById("mode") as HTMLSelectElement;
const input = document.getElementById("expression") as HTMLInputElement;
const output = document.getElementById("output") as HTMLDivElement;
const evalButton = document.getElementById("evaluate") as HTMLButtonElement;
const clrButton = document.getElementById("clear") as HTMLButtonElement;

export class App {
    curLine = -1;

    constructor() { }

    start(): void {
        document.getElementById("loading")?.classList.add("hidden");
        document.getElementById("app")?.classList.remove("hidden");
        writeLine("Initializing...", "info");

        input.addEventListener("keyup", e => this.onKeyPress(e));
        input.addEventListener("keydown", e => onKeyDown);
        evalButton.addEventListener("click", evaluateExpression);
        clrButton.addEventListener("click", clearExpression);
        output.addEventListener("click", copyExpression);

        // writeLine("Mezcal v" + pkg.dependencies.mezcal, "info");
        // writeLine("Math Console v" + data.version, "info");
        writeLine("Ready.", "info");
        input.focus();
    }

    private onKeyPress(ev: KeyboardEvent): void {
        switch (ev.key) {
            case "Enter":
                evaluateExpression();
                break;
            case "ArrowDown":
                if (ev.shiftKey) this.curLine = output.children.length - 3;
                else if (this.curLine < output.children.length - 3) ++this.curLine
                input.value = (output.children.item(this.curLine) as HTMLElement).innerText;
                break;
            case "ArrowUp":
                if (ev.shiftKey) this.curLine = 0;
                else if (this.curLine > 0) --this.curLine
                input.value = (output.children.item(this.curLine) as HTMLElement).innerText;
                break;
        }
        // console.log(this.curLine);
    }
}

function onKeyDown(e: KeyboardEvent): any {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopImmediatePropagation();
    }
}

function evaluateExpression(): void {
    if (!input.value) return;

    writeLine(input.value, "expression");

    if (mode.value !== "eval") {
        addGraph(mode.value as GraphType, ...input.value.split(";"));
    }
    else {
        let text: string;
        try {
            const value = runtime.evaluate(input.value);
            text = value.toString();
            writeLine(text);

            if (typeof value === "number") {
                try {
                    runtime.evaluate(`result=${value}`);
                }
                catch (err: any) {
                    console.error("Error evaluating result:", err.message);
                }
            }
        }
        catch (err: any) {
            if (err.message === "There were parser errors") {
                (err.errors as string[]).forEach(e => writeLine(e, "error"));
            }
            else {
                writeLine(err.message, "error");
            }
        }
    }

    input.value = "";
    input.focus();
}

type MessageType = "expression" | "result" | "error" | "info";

function writeLine(text: string, type: MessageType = "result"): void {
    const p = document.createElement("div");
    p.classList.add(type);
    p.innerText = text;
    output.prepend(p);
}

function clearExpression(): void {
    input.value = "";
    input.focus();
}

function copyExpression(ev: MouseEvent): void {
    const el = ev.target as HTMLElement;
    if (el.classList.contains("result") || el.classList.contains("expression")) {
        input.value = el.innerText;
    }
    input.focus();
}

function addGraph(graphType: GraphType, ...expr: string[]): void {
    const start = Date.now();
    try {
        const gc = document.createElement("graph-canvas") as GraphCanvas;
        gc.setAttribute("width", DEFAULT_GRAPH_SIZE);
        gc.setAttribute("height", DEFAULT_GRAPH_SIZE);
        output.prepend(gc);

        expr.forEach((e, i) => {
            const fn = `function _fn${i}() return ${e}`;
            // console.log(fn);
            runtime.evaluate(fn);
            const g = createGraph(graphType, e, `_fn${i}()`);
            g.settings.color = COLORS[i];
            gc.addGraph(g);
        });
    }
    catch (err: any) {
        console.error(err);
        if (err instanceof MezcalRuntimeError) {
            writeLine(err.errors.join("; "), "error");
        }
        else {
            writeLine(err.message, "error");
        }
    }
    console.log("time", Date.now() - start);
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

