/** Design tokens: terracotta primary, cream secondary, charcoal accent */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: {
      brand: { 50:'#fff4ed',100:'#ffe6d5',200:'#fecaaa',300:'#fda574',400:'#fb763c',500:'#f25016',600:'#d9561f',700:'#b23c14',800:'#8f3216',900:'#762c15' },
      cream: { 50:'#fffdf9',100:'#fbf6ef',200:'#f3eadc' },
      ink: { 700:'#4a3f38',800:'#2b2420',900:'#1c1714' },
    },
    fontFamily: { sans:['Inter','system-ui','sans-serif'], display:['Fraunces','Georgia','serif'] },
    boxShadow: { soft:'0 8px 30px rgba(60,35,15,.08)', lift:'0 18px 40px rgba(60,35,15,.14)' },
  } },
  plugins: [],
}
