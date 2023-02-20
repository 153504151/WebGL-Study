// import { renderInit } from "./render/render_square";
// import { renderInit } from "./render/render_cube";
// import { renderInit } from "./render/render_texture";
// import { renderInit } from "./render/render_light";
import { renderInit } from "./render/render_texture_anima";

function main() {
    console.log("main.ts load ok !!!");
    renderInit();
}

(<any>window).init = main;