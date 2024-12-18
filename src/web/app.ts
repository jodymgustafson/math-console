import { CartesianGraph, GraphCanvas } from "math-graph-canvas/dist";
import { Runtime } from "mezcal/dist/src/runtime";
// import data from "../../data/version.json";
// import pkg from "../../package.json";

const runtime = new Runtime();

const input = document.getElementById("expression") as HTMLInputElement;
const output = document.getElementById("output") as HTMLDivElement;
const evalButton = document.getElementById("evaluate") as HTMLButtonElement;
const clrButton = document.getElementById("clear") as HTMLButtonElement;

export class App {
    constructor() {}

    start(): void {
        document.getElementById("loading")?.classList.add("hidden");
        document.getElementById("app")?.classList.remove("hidden");
        writeLine("Initializing...", "info");

        input.addEventListener("keypress", onKeyPress)
        evalButton.addEventListener("click", evaluateExpression);
        clrButton.addEventListener("click", clearExpression);
        output.addEventListener("click", copyExpression)

        // writeLine("Mezcal v" + pkg.dependencies.mezcal, "info");
        // writeLine("Math Console v" + data.version, "info");
        writeLine("Ready.", "info");
        input.focus();    
    }
}

function onKeyPress(ev: KeyboardEvent) {
    if (ev.key === "Enter") {
        evaluateExpression();
    }
}

function evaluateExpression(): void {
    if (!input.value) return;

    writeLine(input.value, "expression");

    if (input.value.startsWith("graph:")) {
        addGraph(input.value.slice("graph:".length).trim());
        return;
    }

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
}

function addGraph(expr: string): void {
    const gc = document.createElement("graph-canvas") as GraphCanvas;
    gc.setAttribute("width", "200");
    gc.setAttribute("height", "200");
    output.prepend(gc);

    const start = Date.now();
    runtime.evaluate(`function _fn() return ${expr}`);

    const g = new CartesianGraph(expr, (x) => {
        runtime.interpreter.globals.setVariable("x", x)
        const value = runtime.evaluate(`_fn()`) as number;
        return value;
    });
    
    gc.addGraph(g);

    console.log("time", Date.now() - start);
}

