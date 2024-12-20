import { GraphType } from "math-graph-canvas/dist/src/graphs/graph";
import { MezcalRuntimeError } from "mezcal/dist/src/runtime";
import { createGraphCanvas, parser } from "./createGraphCanvas";
// import { createGraphCanvas, runtime } from "./mezcal/createGraphCanvas";
// import data from "../../data/version.json";
// import pkg from "../../package.json";

const runtime = parser;
const mode = document.getElementById("mode") as HTMLSelectElement;
const input = document.getElementById("expression") as HTMLInputElement;
const output = document.getElementById("output") as HTMLDivElement;
const evalButton = document.getElementById("evaluate") as HTMLButtonElement;
const clrButton = document.getElementById("clear") as HTMLButtonElement;

export class App {
    curLine = -1;
    startLine = 0;

    constructor() { }

    start(): void {
        document.getElementById("loading")?.classList.add("hidden");
        document.getElementById("app")?.classList.remove("hidden");
        writeLine("Initializing...", "info");

        input.addEventListener("keyup", e => this.onKeyPress(e));
        input.addEventListener("keydown", onKeyDown);
        evalButton.addEventListener("click", () => this.onEvaluate());
        clrButton.addEventListener("click", clearExpression);
        output.addEventListener("click", copyExpression);

        // writeLine("Mezcal v" + pkg.dependencies.mezcal, "info");
        // writeLine("Math Console v" + data.version, "info");
        writeLine("Ready.", "info");
        this.startLine = output.children.length + 1;
        input.focus();
    }

    private onKeyPress(ev: KeyboardEvent): void {
        switch (ev.key) {
            case "Enter":
                this.onEvaluate();
                break;
            case "ArrowDown":
                if (ev.shiftKey) this.curLine = output.children.length - this.startLine;
                else if (this.curLine < output.children.length - this.startLine) ++this.curLine
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

    private onEvaluate(): void {
        if (!input.value) return;
    
        writeLine(input.value, "expression");
    
        if (mode.value !== "eval") {
            addGraph();
        }
        else {
            evaluateExpression();
        }
    
        this.curLine = -1;
        input.value = "";
        input.focus();
    }
}

function onKeyDown(e: KeyboardEvent): any {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
    }
}

type MessageType = "expression" | "result" | "error" | "info";

function evaluateExpression() {
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

function addGraph() {
    try {
        const gc = createGraphCanvas(mode.value as GraphType, ...input.value.split(";"));
        output.prepend(gc);
    }
    catch (err: any) {
        if (err instanceof MezcalRuntimeError) {
            writeLine(err.errors.join("; "), "error");
        }
        else {
            console.error(err);
            writeLine(err.message, "error");
        }
    }
}

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

