const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`
export const chefs = [
 { id:1, verified:true, certifications:['FSSAI Licensed','Culinary Arts Diploma'], name:'Ravi Kumar', city:'Nellore', years:12, cuisines:['South Indian','Andhra'], rating:4.9, reviews:212, price:2500, available:true, match:96, photo:IMG('photo-1577219491135-ce391730fb2c'), bio:'Authentic Andhra home-style cooking for family dinners and functions.' },
 { id:2, verified:true, certifications:['FSSAI Licensed','Food Safety Level 2'], name:'Ayesha Khan', city:'Hyderabad', years:9, cuisines:['Mughlai','Biryani'], rating:4.8, reviews:340, price:3500, available:true, match:92, photo:IMG('photo-1583394838336-acd977736f90'), bio:'Dum biryani and Mughlai specialist for large gatherings.' },
 { id:3, verified:true, certifications:['Le Cordon Bleu','FSSAI Licensed'], name:'Marco Rossi', city:'Bengaluru', years:15, cuisines:['Italian','Continental'], rating:4.7, reviews:128, price:5000, available:false, match:85, photo:IMG('photo-1583394293214-28ded15ee548'), bio:'Fine-dining Italian experiences in your own kitchen.' },
 { id:4, verified:true, certifications:['FSSAI Licensed','Sattvic Cooking Certified'], name:'Lakshmi Devi', city:'Vijayawada', years:20, cuisines:['Vegetarian','South Indian'], rating:4.9, reviews:175, price:1800, available:true, match:90, photo:IMG('photo-1607631568010-a87245c0daf8'), bio:'Pure vegetarian feasts for festivals, poojas and weddings.' },
 { id:5, verified:true, certifications:['FSSAI Licensed','Grill Master Certificate'], name:'Arjun Reddy', city:'Nellore', years:7, cuisines:['BBQ','Party Catering'], rating:4.6, reviews:96, price:3000, available:true, match:88, photo:IMG('photo-1581299894007-aaa50297cf16'), bio:'Live grills and party menus that keep guests talking.' },
 { id:6, verified:true, certifications:['FSSAI Licensed','Seafood Handling Certified'], name:'Meera Nair', city:'Bengaluru', years:11, cuisines:['Kerala','Seafood'], rating:4.8, reviews:151, price:3200, available:true, match:83, photo:IMG('photo-1595273670150-bd0c3c392e46'), bio:'Coastal Kerala flavours with fresh seafood and appams.' },
]
export const cuisines = [
 { name:'South Indian', emoji:'🍛', count:120 }, { name:'Mughlai', emoji:'🍗', count:85 }, { name:'Italian', emoji:'🍝', count:64 },
 { name:'Vegetarian', emoji:'🥗', count:98 }, { name:'BBQ', emoji:'🔥', count:47 }, { name:'Desserts', emoji:'🍰', count:52 },
]
