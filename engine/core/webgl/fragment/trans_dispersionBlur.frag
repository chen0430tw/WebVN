#ifdef GL_ES
precision mediump float;
#endif
#define QUALITY 32
uniform sampler2D from;
uniform sampler2D to;
uniform float progress;
uniform vec2 resolution;
const float GOLDEN_ANGLE = 2.399963229728653;
vec4 blur(sampler2D t, vec2 c, float radius) {
    vec4 sum = vec4(0.0);
    float q = float(QUALITY);
    for (int i=0; i<QUALITY; ++i) {
        float fi = float(i);
        float a = fi * GOLDEN_ANGLE;
        float r = sqrt(fi / q) * radius;
        vec2 p = c + r * vec2(cos(a), sin(a));
        sum += texture2D(t, p);
    }
    return sum / q;
}
void main()
{
    vec2 p = gl_FragCoord.xy / resolution.xy;
    float inv = 1.-progress;
    gl_FragColor = inv*blur(from, p, progress*0.6) + progress*blur(to, p, inv*0.6);
}