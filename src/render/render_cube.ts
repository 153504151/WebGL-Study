// glmatrix.js => 方法中的第一个参数用来接收结果
import { mat4 } from "gl-matrix";

export const renderInit = () => {
    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
    // 初始化 WebGL 上下文
    const gl = canvas.getContext("webgl");

    // 确认 WebGL 支持性
    if (!gl) {
        console.error("无法初始化 WebGL,你的浏览器、操作系统或硬件等可能不支持 WebGL.");
        return;
    }

    const cubeShaderProgram: CubeShaderProgram = new CubeShaderProgram(gl);
    cubeShaderProgram.initBuffers();
    
    render(cubeShaderProgram);
}

function render(shader: CubeShaderProgram) {
    shader.render();
    requestAnimationFrame(() => {
        render(shader);
    });
}

class CubeShaderProgram {
    public rotate: number = 0;

    public cubeVerticesIndexBuffer: WebGLBuffer; // 顶点编号buff
    public posAndColorBuffer: WebGLBuffer; // 顶点 + 颜色数据buff
    
    public program: WebGLProgram;        // 着色器程序
    private aspect: number

    constructor(
        public gl: WebGLRenderingContext
    ) {
        this.aspect = (gl.canvas as HTMLCanvasElement).clientWidth / (gl.canvas as HTMLCanvasElement).clientHeight; // 画布宽高比
        this.program = this.initShaderProgram();
    }

    public initBuffers() {
        const gl = this.gl;

        this.posAndColorBuffer = gl.createBuffer();
        const posAndColor = new Float32Array([
            // Front face
            -1.0, -1.0,  1.0, 1.0,  1.0,  1.0,  1.0,
            1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0, 1.0,  1.0,  1.0,  1.0,
            // Back face
            -1.0, -1.0, -1.0, 0.0,  1.0,  0.0,  1.0,
            1.0, -1.0, -1.0,  0.0,  1.0,  0.0,  1.0,
            1.0,  1.0, -1.0,  0.0,  1.0,  0.0,  1.0,
            -1.0,  1.0, -1.0, 0.0,  1.0,  0.0,  1.0

            // 优化顶点之后，共用颜色，由 24 个顶点数据 变成 8 个顶点数据
            // // Top face
            // -1.0,  1.0, -1.0, 0.0,  1.0,  0.0,  1.0,
            // -1.0,  1.0,  1.0, 0.0,  1.0,  0.0,  1.0,
            // 1.0,  1.0,  1.0,  0.0,  1.0,  0.0,  1.0,
            // 1.0,  1.0, -1.0,  0.0,  1.0,  0.0,  1.0,
            // // Bottom face
            // -1.0, -1.0, -1.0, 0.0,  0.0,  1.0,  1.0,
            // 1.0, -1.0, -1.0,  0.0,  0.0,  1.0,  1.0,
            // 1.0, -1.0,  1.0,  0.0,  0.0,  1.0,  1.0,
            // -1.0, -1.0,  1.0, 0.0,  0.0,  1.0,  1.0,
            // // Right face
            // 1.0, -1.0, -1.0,  1.0,  1.0,  0.0,  1.0,
            // 1.0,  1.0, -1.0,  1.0,  1.0,  0.0,  1.0,
            // 1.0,  1.0,  1.0,  1.0,  1.0,  0.0,  1.0,
            // 1.0, -1.0,  1.0,  1.0,  1.0,  0.0,  1.0,
            // // Left face
            // -1.0, -1.0, -1.0, 1.0,  0.0,  1.0,  1.0,
            // -1.0, -1.0,  1.0, 1.0,  0.0,  1.0,  1.0,
            // -1.0,  1.0,  1.0, 1.0,  0.0,  1.0,  1.0,
            // -1.0,  1.0, -1.0, 1.0,  0.0,  1.0,  1.0
        ]);
        // 应用缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posAndColorBuffer);
        // 填充缓冲区数据
        gl.bufferData(gl.ARRAY_BUFFER, posAndColor, gl.STATIC_DRAW);

        // 每个顶点不复用的构建方式
        // const vertexIndex = new Uint16Array([
        //     0,  1,  2,      0,  2,  3,    // front
        //     4,  5,  6,      4,  6,  7,    // back
        //     8,  9,  10,     8,  10, 11,   // top
        //     12, 13, 14,     12, 14, 15,   // bottom
        //     16, 17, 18,     16, 18, 19,   // right
        //     20, 21, 22,     20, 22, 23    // left
        // ]);
        // 复用顶点的索引构建
        const vertexIndex = new Uint16Array([
            0, 1, 2, 0, 2, 3,  // front
            4, 5, 6, 4, 6, 7,  // back
            3, 2, 6, 3, 6, 7,  // top
            0, 1, 5, 0, 4, 5,  // bottom
            0, 3, 7, 0, 4, 7,  // left
            2, 5, 6, 2, 3, 6   // right
        ]);
        this.cubeVerticesIndexBuffer =  gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVerticesIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertexIndex, gl.STATIC_DRAW);
    }

    public bindMatrix = () => {
        let gl = this.gl;
        let program = this.program;

        let projectionMatrix = mat4.create(); // 生成摄像机投影矩阵
        mat4.perspective(projectionMatrix, 45 * Math.PI / 180, this.aspect, 0.1, 100); // 视野45度  画布大小比 截头体的最近距离
        const vertexProjectionMatrix = gl.getUniformLocation(program, 'iPMatrix'); // 投影矩阵
        gl.uniformMatrix4fv(vertexProjectionMatrix, false, projectionMatrix); // 应用投影矩阵
        
        let viewMatrix = mat4.create(); // 生成矩阵，设置绘图点
        mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -12.0]); // 按给定矢量平移矩阵,  z 轴越小距离越远，看起来越小
        mat4.rotate(viewMatrix, viewMatrix, this.rotate, [0, 1, 1]); // 旋转矩阵, 旋转角度，需要围绕那个轴旋转
        const vertexViewMatrix = gl.getUniformLocation(program, 'iVMatrix'); // 视图矩阵
        gl.uniformMatrix4fv(vertexViewMatrix, false, viewMatrix); // 应用视图矩阵
    }

    public render = () => {
        this.rotate += 0.01;
        let gl = this.gl;
        let program = this.program;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 清除颜色缓冲区
        gl.clearDepth(1.0);                 // 清除深度缓冲区
        gl.enable(gl.DEPTH_TEST);           // 启用深度测试 （深度测试默认是禁用的）
        gl.depthFunc(gl.LEQUAL);            // 指定深度测试比较函数
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // 清除画布

        // 设置当前的程序
        gl.useProgram(program);
        
        // 应用矩阵
        this.bindMatrix();

        // 取到顶点属性 index
        const vertexPosition = gl.getAttribLocation(program, 'iPosition');
        const vertexColor = gl.getAttribLocation(program, 'iColor');

        // 应用buff数据到顶点
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posAndColorBuffer); // 合并的写法
        // 设置位置
        gl.vertexAttribPointer(vertexPosition,
            3,                    // 顶点的 数据 数据量
            gl.FLOAT,             // 数据类型是32位浮点数
            false,                // 不进行归一化
            7 * 4,                // 7 (一个位置数据 3 + 一个颜色数据 4) * 4 (Float32Array 中 一个数据所占字节 Float32Array.BYTES_PER_ELEMENT)
            0 * 4);               // 从缓冲区中第几位开始取值 (假设有第二个属性，那么第二个属性就是从 第一个数据的数据量 3 * 4 开始)
        gl.enableVertexAttribArray(vertexPosition);
        // 设置颜色
        gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 7 * 4, 3 * 4);
        gl.enableVertexAttribArray(vertexColor);
        
        // 应用顶点索引buff
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVerticesIndexBuffer);
        // 顶点绘制
        // 需要绘制的顶点数量, 在索引buff cubeVerticesIndexBuffer 中 , 三个顶点索引为 1 个面
        gl.drawElements(gl.TRIANGLES,  6 * 6, gl.UNSIGNED_SHORT, 0);
        // gl.POINTS 绘制一系列点
        // gl.LINE_STRIP 绘制一系列线段，顶点相连
        // gl.LINE_LOOP 绘制一系列线段，最后一点和第一点相连
        // gl.LINES 绘制一系列线段，线段之间不连接 （假设有 4 个点，就会 1 2 为一段， 3  4 为一段不会连接）
        // gl.TRIANGLE_STRIP 绘制一个三角带 （顶点顺序 ABCD => ABC + BDC）
        // gl.TRIANGLE_FAN 绘制一个三角扇 （顶点顺序 ABCD => ABC + CDA）
        // gl.TRIANGLES 绘制一系列三角形。每三个点为顶点 （假设有 4 个点，就会 1 2 3 为一个三角形， 4 为一段不会连接）
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  
    }

    private initShaderProgram() {
        const gl = this.gl;
        const vertexShader = this.initShader(gl.VERTEX_SHADER, this.getVertexSource());
        const fragmentShader = this.initShader(gl.FRAGMENT_SHADER, this.getFragmentSource());
        console.log(vertexShader, fragmentShader);
    
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        // 查看着色器程序是否链接成功
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    }

    private initShader(type: GLenum, source: string) {
        // 创建着色器
        const shader = this.gl.createShader(type);
    
        // 将代码片段设置到shader
        this.gl.shaderSource(shader, source);
    
        // 编译着色器
        this.gl.compileShader(shader);
    
        // 查看编译是否成功
        if (! this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(`type: ${type} compile error`,  this.gl.getShaderInfoLog(shader)); // 捕获日志信息
            this.gl.deleteShader(shader);
            return null;
        }
    
        return shader;
    }

    private getVertexSource = () => {
        return `
            attribute vec4 iPosition; // 顶点位置
            uniform mat4 iPMatrix;    // 透视矩阵
            uniform mat4 iVMatrix;    // 视图矩阵

            attribute vec4 iColor;    // 顶点颜色
        
            varying vec4 vColor;      // 传递给片元着色器的颜色值
        
            void main() {
                gl_Position = iPMatrix * iVMatrix * vec4(iPosition); // 计算顶点位置
                vColor = iColor;      // 传递颜色
            }
        `;
    }

    private getFragmentSource = () => {
        return `
            precision lowp float; // 定义为低精度
            varying vec4 vColor;  // 接收一个颜色值
            void main() {
                gl_FragColor = vColor; // 设置颜色值
            }
        `;
    }
}

