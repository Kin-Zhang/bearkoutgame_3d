# Breakout_Game_3D
原来链接在gitee上：[https://gitee.com/kin_zhang/bearkoutgame_3d](https://gitee.com/kin_zhang/bearkoutgame_3d) 还有presentation时候的录像等视频资料
The origin link is on gitee.com: [https://gitee.com/kin_zhang/bearkoutgame_3d](https://gitee.com/kin_zhang/bearkoutgame_3d) whichi have videos about proposal and presentation

#### 介绍/ Description
这是一个3D的breakout game，整体框架搭建由张聪明(Kin)完成，具体代码部分，请参考代码块的[readme](https://gitee.com/kin_zhang/bearkoutgame_3d/tree/master/3D-Breakout-Game) 如果感兴趣，继续完成了TODO可以欢迎发起pull request~

This is a 3D breakout game. Project from COMP5411 (HKUST). The first version of the project was done by Kin. If you are interested to complete the whole game or improve the game, please commit pull request. I'm really happy to see others improve it.

TODO List:
 * [1] CSS the website need some interface to give information about the game(life win lose?)
 * [2] speed up the rendering

#### 软件架构/ Instructions
整个游戏分为：游戏逻辑（碰撞逻辑）、墙 球 板子 平面 场景的纹理导入（texture）、渲染部分（反射和折射）、控制面板（对光效、视角人称的控制）

The whole game include: game logic (collision), the texture of bricks,the ball, the paddle, the board and the scene's background, rendering part(reflection and refraction), control panel(light, perspective control and ball's rendering)

#### 安装教程/ How to run
不需要安装依赖，直接git clone整个代码 three的库都已经包含在include_js的文件夹中，详情可参阅[Code readme](https://gitee.com/kin_zhang/bearkoutgame_3d/tree/master/3D-Breakout-Game)，直接安装VSCode用Live Server然后右下角会有Go live是最快的运行代码方式
或者直接在github的Page页试 **[Click here to try it](https://kin-zhang.github.io/bearkoutgame_3d/3D-Breakout-Game/)**

[Code readme](https://gitee.com/kin_zhang/bearkoutgame_3d/tree/master/3D-Breakout-Game)

Or **[Click here to try it](https://kin-zhang.github.io/bearkoutgame_3d/3D-Breakout-Game/)**

#### 使用说明/ How to play
使用键盘去左右控制paddle，按空格开始发射球。

Use the **keyboard** to control the paddle left and right, press the **space** to start the ball.
#### 参与贡献/ Contribution
1. 张聪明（Kin) 
2. 云舒（Jeremy）
#### 参考资料/ Reference
 * [1] https://threejs.org/ Three.js libaray -> Use it to render scene
 * [2] https://www.youtube.com/watch?v=FyZ4_T0GZ1U 2D Breakout Game Using JavaScript and HTML [beginners] -> Use for game logical
 * [3] https://github.com/fncombo -> Look for the 3D texture & partical effect & game map
 * [4] https://en.wikipedia.org/wiki/Breakout_(video_game) -> Background of breakout game
 * [5] https://github.com/squarefeet/ShaderParticleEngine -> Shader Particle Engine explode effect with three.js
 * [6] https://threejs.org/examples/webgl_materials_cubemap_dynamic.html -> reflection effect reference
