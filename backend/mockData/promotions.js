const promotions = [
  {
    title: "Літня знижка на геліві кульки",
    description: "Знижка 20% на всі геліві кульки у нашому магазині. Ідеально для літніх вечірок під відкритим небом.",
    discount: 20,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    isActive: true
  },
  {
    title: "Фольговані кульки 3+1",
    description: "При купівлі 3 фольгованих кульок, отримайте ще один у подарунок! Пропозиція обмежена.",
    discount: 25,
    startDate: new Date('2024-04-15'),
    endDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    title: "Спеціальна пропозиція до Дня Незалежності",
    description: "Знижка 15% на всі тематичні набори 'Прапор України'. Святкуймо разом!",
    discount: 15,
    startDate: new Date('2024-08-15'),
    endDate: new Date('2024-08-31'),
    isActive: false
  },
  {
    title: "Святкуємо День Закоханих",
    description: "Купуйте романтичні набори повітряних кульок зі знижкою 30% до Дня Святого Валентина.",
    discount: 30,
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-02-14'),
    isActive: false
  },
  {
    title: "Великий розпродаж LED-кульок",
    description: "Знижка 35% на світлові LED-кульки для незабутніх нічних вечірок.",
    discount: 35,
    startDate: new Date('2024-03-10'),
    endDate: new Date('2024-04-10'),
    isActive: true
  },
  {
    title: "Набір для дитячого дня народження",
    description: "Спеціальна знижка 25% на всі святкові набори для дитячих днів народження.",
    discount: 25,
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-10-01'),
    isActive: false
  }
];

export default promotions;