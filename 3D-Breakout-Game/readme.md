# GroupID: 4

# To run our project, directly ...
- use VSCode - live server
- use Webstorm - run the html file directly
- enter this to your browser: kin_zhang.gitee.io/comp5411_v3

# Members:
- Qingwen ZHANG 20749872 qzhangcb@connect.ust.hk
- Junming CHEN 20750649 jeremy.junming.chen@connect.ust.hk

# Workload Breakdown:
- Qingwen(57%): Wrote the first version of code includes game logic, flame explosion and particle effect, control panel, sky sphere, fix problems of incomplete real-time reflection & static rendering on refraction, and made the game demo part of the video.

- Junming(43%): Added new rendering features including real-time dynamic reflection & refraction and a skybox for better reflection effects, control panel for rendering effects, corrected ball and bricks' position, wrote and presented the slides.

# Major Challenges:
We implemented the game with various rendering effects from scratch, wrote complete breakout game logic and spent a lot of time to fix many weird bugs. The coding is mainly in `main.js`.

# Reference:
Altough we used google, youtube and three.js library to learn things and refer their code, the whole game and rendering logical still finished by us. Here are the reference links and also describe which part of the project we use them. It is also located in the main.js file. It's also in the main.js file.
 * [1] https://threejs.org/ Three.js libaray -> Use it to render scene
 * [2] https://www.youtube.com/watch?v=FyZ4_T0GZ1U 2D Breakout Game Using JavaScript and HTML [beginners] -> Use for game logical
 * [3] https://github.com/fncombo -> Look for the 3D texture & partical effect & game map
 * [4] https://en.wikipedia.org/wiki/Breakout_(video_game) -> Background of breakout game
 * [5] https://github.com/squarefeet/ShaderParticleEngine -> Shader Particle Engine explode effect with three.js
 * [6] https://threejs.org/examples/webgl_materials_cubemap_dynamic.html -> reflection effect reference