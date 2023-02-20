// glmatrix.js => 方法中的第一个参数用来接收结果
import { mat4 } from "gl-matrix";
import { Texture01 } from "../res/texture01";
import { MouseControl } from "../utlis/mouse_control";

export const renderInit = () => {
    const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
    // 初始化 WebGL 上下文
    const gl = canvas.getContext("webgl");

    // 确认 WebGL 支持性
    if (!gl) {
        console.error("无法初始化 WebGL,你的浏览器、操作系统或硬件等可能不支持 WebGL.");
        return;
    }

    const mouseControl: MouseControl = new MouseControl(canvas);
    const textureShaderProgram: TextureShaderProgram = new TextureShaderProgram(gl, mouseControl);

    render(textureShaderProgram);
}

function render(shader: TextureShaderProgram) {
    shader.render();
    requestAnimationFrame(() => {
        render(shader);
    });
}

class TextureShaderProgram {
    public cubeVerticesTextureCoordBuffer: WebGLBuffer; // 每个顶点对应的纹理坐标
    public cubeVerticesIndexBuffer: WebGLBuffer; // 顶点编号buff
    public positionBuffer: WebGLBuffer; // 顶点数据buff
    public cubeTexture: WebGLTexture;
    
    public program: WebGLProgram;        // 着色器程序
    public aspect: number;

    constructor(
        public gl: WebGLRenderingContext,
        private readonly mouseEvent: MouseControl
    ) {
        this.aspect = (gl.canvas as HTMLCanvasElement).clientWidth / (gl.canvas as HTMLCanvasElement).clientHeight; // 画布宽高比
        this.program = this.initShaderProgram();
        this.initTextures();
        this.initBuffers();
    }

    private initTextures() {
        let gl = this.gl;
        this.cubeTexture = gl.createTexture();
        let cubeImage = new Image();
        cubeImage.src = Texture01;        
        cubeImage.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.cubeTexture); // 我们通过把新创建的纹理对象绑定到 gl.TEXTURE_2D 来让它成为当前操作纹理
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cubeImage); // 把已经加载的图片图形数据写到纹理。
            // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 256, 0, gl.RGB, gl.UNSIGNED_BYTE, null); // 把已经加载的图片图形数据写到纹理。

            // gl.TEXTURE_MAP_FILTER 纹理需要放大时 （画布 > 纹理）
            // gl.TEXTURE_MIN_FILTER 纹理需要缩小时 （画布 < 纹理）
            // gl.NEAREST 最近点采样
            // gl.LINEAR 线性纹理过滤(双线性过滤)
            // gl.LINEAR_MIPMAP_LINEAR mipmap纹理过滤(三线性过滤) 

            // gl.TEXTURE_WRAP_S 水平填充时
            // gl.TEXTURE_WRAP_T 垂直填充时
            // gl.REPEAT 平铺式的重复纹理
            // gl.MIRRORED_REPEAT 镜像对称的重复纹理
            // gl.CLAMP_TO_EDGE 使用纹理图像边缘值

            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // 过滤器用来控制当图片缩放时像素如何生成如何插值 放大是线性过滤
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST); // 缩小使用的是多级渐进纹理过滤
            gl.generateMipmap(gl.TEXTURE_2D); // 生成多级渐进纹理
            gl.bindTexture(gl.TEXTURE_2D, null);
        } 
    }

    private initBuffers() {
        const gl = this.gl;

        this.positionBuffer = gl.createBuffer();
        const position = new Float32Array([
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            // Back face
            -1.0, -1.0,  -1.0,
            1.0, -1.0,  -1.0,
            1.0,  1.0,  -1.0,
            -1.0,  1.0,  -1.0,
            // Top face
            -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, -1.0,
            -1.0,  1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            // Right face
            1.0, -1.0,  1.0,
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ]);
        // 绑定缓冲区（指的是绑定当前缓冲区到，如果从缓冲区取数据时，每次需要重新绑定）
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        // 填充缓冲区数据
        gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // 每个顶点不复用的构建方式
        const vertexIndex = new Uint16Array([
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23    // left
        ]);
        this.cubeVerticesIndexBuffer =  gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVerticesIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertexIndex, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        const textureCoord = new Float32Array([
            // Front
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Back
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // 0.0,  0.0,
            // 1.0,  0.0,
            // Top
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Bottom
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Right
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            // Left
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0
        ])

        this.cubeVerticesTextureCoordBuffer =  gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, textureCoord, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public bindMatrix = () => {
        let gl = this.gl;
        let program = this.program;

        // 投影矩阵
        let projectionMatrix = mat4.create(); // 生成摄像机投影矩阵
        mat4.perspective(projectionMatrix, 45 * Math.PI / 180, this.aspect, 0.1, 100); // 视野45度  画布大小比 截头体的最近距离
        const vertexProjectionMatrix = gl.getUniformLocation(program, 'iPMatrix'); // 投影矩阵
        gl.uniformMatrix4fv(vertexProjectionMatrix, false, projectionMatrix); // 应用相机投影矩阵

        // 视图矩阵
        let viewMatrix = mat4.create(); // 生成矩阵，设置绘图点
        mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -12.0]); // 按给定矢量平移矩阵,  z 轴越小距离越远，看起来越小
        if (this.mouseEvent) {
            let [rx, ry] = this.mouseEvent.rotate;
            mat4.rotate(viewMatrix, viewMatrix, rx, [0, 1, 0]); // 旋转矩阵, 旋转角度，需要围绕那个轴旋转
            mat4.rotate(viewMatrix, viewMatrix, ry, [1, 0, 0]); // 旋转矩阵, 旋转角度，需要围绕那个轴旋转
        }
        const vertexViewMatrix = gl.getUniformLocation(program, 'iVMatrix'); // 视图矩阵
        gl.uniformMatrix4fv(vertexViewMatrix, false, viewMatrix); // 应用视图矩阵
    }

    public renderBefore = () => {
        let gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 清除颜色缓冲区
        gl.clearDepth(1.0);                 // 清除深度缓冲区
        gl.enable(gl.DEPTH_TEST);           // 启用深度测试 （深度测试默认是禁用的）
        gl.depthFunc(gl.LEQUAL);            // 指定深度测试比较函数
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // 清除画布
        gl.bindBuffer(gl.ARRAY_BUFFER, null);   // 清除缓冲区
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); // 清除缓冲区
        gl.bindTexture(gl.TEXTURE_2D, null);   // 清除绑定的纹理
    }

    public render = () => {
        this.renderBefore();        
        let gl = this.gl;
        let program = this.program;

        // 设置当前的程序
        gl.useProgram(program);
        
        // 取到采样器
        const fragmentSampler = gl.getUniformLocation(program, "iSampler");
        gl.activeTexture(gl.TEXTURE0); // 激活纹理
        gl.bindTexture(gl.TEXTURE_2D, this.cubeTexture); // 绑定纹理
        gl.uniform1i(fragmentSampler, 0); // 应用到采样器

        // 应用矩阵
        this.bindMatrix();

        // 取到顶点属性 index
        const vertexPosition = gl.getAttribLocation(program, 'iPosition');
        const vertexTextureCoord = gl.getAttribLocation(program, "iTextureCoord");    
        // 设置位置
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 3 * 4, 0 * 4);
        gl.enableVertexAttribArray(vertexPosition);
        // 设置纹理
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesTextureCoordBuffer);
        gl.vertexAttribPointer(vertexTextureCoord, 2, gl.FLOAT, false, 2 * 4, 0 * 4);
        gl.enableVertexAttribArray(vertexTextureCoord);

        // 顶点绘制
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVerticesIndexBuffer);
        gl.drawElements(gl.TRIANGLES,  6 * 6, gl.UNSIGNED_SHORT, 0); // 需要绘制的顶点数量, 在索引buff cubeVerticesIndexBuffer 中 , 三个顶点索引为 1 个面
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
            attribute vec4 iPosition;     // 顶点坐标
            uniform mat4 iPMatrix;        // 投影矩阵
            uniform mat4 iVMatrix;        // 视图矩阵

            attribute vec2 iTextureCoord; // 纹理坐标

            varying vec2 vTextureCoord;   // 传递给片元着色器的纹理坐标
        
            void main() {
                gl_Position = iPMatrix * iVMatrix * vec4(iPosition); // 计算顶点位置
                vTextureCoord = iTextureCoord; // 传递纹理坐标
            }
        `;
    }

    private getFragmentSource = () => {
        return `
            precision lowp float; // 定义为低精度

            varying vec2 vTextureCoord; // 接收纹理坐标
            uniform sampler2D iSampler; // 纹理采样器

            void main() {
                gl_FragColor = texture2D(iSampler, vec2(vTextureCoord.s, vTextureCoord.t)); // 计算颜色
            }
        `;
    }
}

