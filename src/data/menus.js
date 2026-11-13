// Sample menus used by the chef detail page and the mock AI menu planner.
const M = {
  'South Indian': { veg:true, courses:[['Starters',['Medu vada','Mirchi bajji','Punugulu']],['Mains',['Pulihora','Gongura dal','Sambar rice','Beans poriyal','Papad & pickle']],['Desserts',['Payasam','Bobbatlu']]] },
  Andhra: { veg:false, courses:[['Starters',['Chilli chicken (Andhra style)','Apollo fish']],['Mains',['Gongura mutton','Natu kodi pulusu','Andhra veg meals','Steamed rice']],['Desserts',['Double ka meetha']]] },
  Mughlai: { veg:false, courses:[['Starters',['Seekh kebab','Paneer tikka']],['Mains',['Chicken biryani','Butter chicken','Dal makhani','Naan']],['Desserts',['Shahi tukda','Phirni']]] },
  Biryani: { veg:false, courses:[['Starters',['Chicken 65','Veg manchurian']],['Mains',['Hyderabadi dum biryani','Mirchi ka salan','Raita']],['Desserts',['Qubani ka meetha']]] },
  Italian: { veg:true, courses:[['Starters',['Bruschetta','Caprese salad']],['Mains',['Penne arrabbiata','Mushroom risotto','Margherita pizza']],['Desserts',['Tiramisu','Panna cotta']]] },
  Continental: { veg:false, courses:[['Starters',['Garlic mushrooms','Tomato soup']],['Mains',['Grilled chicken with herbs','Mashed potatoes','Sautéed vegetables']],['Desserts',['Chocolate lava cake']]] },
  Vegetarian: { veg:true, courses:[['Starters',['Paneer tikka','Hara bhara kebab']],['Mains',['Paneer butter masala','Mixed veg curry','Jeera rice','Phulka']],['Desserts',['Gulab jamun','Rasmalai']]] },
  BBQ: { veg:false, courses:[['Starters',['Grilled chicken wings','Tandoori paneer']],['Mains',['BBQ ribs','Peri-peri chicken','Grilled corn','Garlic bread']],['Desserts',['Grilled pineapple with ice cream']]] },
  'Party Catering': { veg:false, courses:[['Starters',['Assorted finger food','Live chaat counter']],['Mains',['Fried rice & noodles','Chicken curry','Veg kofta','Naan']],['Desserts',['Ice cream bar']]] },
  Kerala: { veg:false, courses:[['Starters',['Banana chips','Kerala fish fry']],['Mains',['Appam with stew','Malabar parotta','Kerala chicken roast','Avial']],['Desserts',['Ada pradhaman']]] },
  Seafood: { veg:false, courses:[['Starters',['Prawn fry','Calamari']],['Mains',['Fish curry','Prawn masala','Lemon rice']],['Desserts',['Coconut pudding']]] },
}
const FALLBACK = M.Vegetarian
export const menuFor = (cuisine, { vegOnly = false } = {}) => {
  const m = M[cuisine] || FALLBACK
  const courses = m.courses.map(([name, items]) => ({ name, items: vegOnly ? items.filter((i) => !/chicken|mutton|fish|prawn|calamari|kodi|ribs|seafood|wings|lamb/i.test(i)) : items })).filter((c) => c.items.length)
  return courses
}
export const chefMenus = (cuisines = []) => cuisines.slice(0, 3).map((c) => ({ cuisine: c, courses: menuFor(c) }))
export const knownCuisines = Object.keys(M)
