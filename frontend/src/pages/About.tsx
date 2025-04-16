import React from "react";

const About = () => {
  return (
    <div className="container py-10 md:py-16">
      <h1 className="mb-6 text-3xl font-bold md:text-4xl">Про компанію</h1>
      
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-2xl font-semibold">Наша історія</h2>
            <p className="text-muted-foreground">
              Планета Кульок розпочала свій шлях у 2024 році як маленький магазин 
              святкових аксесуарів. З тих пір ми виросли до найбільшого постачальника 
              повітряних кульок та святкового декору в регіоні, залишаючись при цьому 
              сімейним бізнесом, який цінує кожного клієнта.
            </p>
          </div>
          
          <div>
            <h2 className="mb-3 text-2xl font-semibold">Наша місія</h2>
            <p className="text-muted-foreground">
              Ми прагнемо робити кожне свято незабутнім, пропонуючи якісні повітряні кульки 
              та декор за доступними цінами. Наша команда працює, щоб кожен клієнт отримав 
              саме те, що потрібно для створення атмосфери радості та веселощів.
            </p>
          </div>
          
          <div>
            <h2 className="mb-3 text-2xl font-semibold">Наші цінності</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Якість - ми пропонуємо лише перевірені товари від надійних постачальників</li>
              <li>Сервіс - завжди готові допомогти підібрати найкращі рішення для вашого свята</li>
              <li>Доступність - працюємо з різними бюджетами, щоб свято було у кожному домі</li>
              <li>Екологічність - пропонуємо біорозкладні альтернативи традиційним кулькам</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg max-w-sm mx-auto">
            <img 
              src="/images/our-team.png" 
              alt="Команда Планета Кульок" 
              className="h-auto w-full object-cover" 
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x400?text=Наша+команда";
              }}
            />
          </div>
          
          <div>
            <h2 className="mb-3 text-2xl font-semibold">Наші досягнення</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-3xl font-bold text-primary">14+</p>
                <p className="text-sm text-muted-foreground">років досвіду</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-3xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">задоволених клієнтів</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-3xl font-bold text-primary">100+</p>
                <p className="text-sm text-muted-foreground">різних товарів</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-3xl font-bold text-primary">10+</p>
                <p className="text-sm text-muted-foreground">корпоративних клієнтів</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
