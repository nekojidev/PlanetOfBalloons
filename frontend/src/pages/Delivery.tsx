import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const Delivery = () => {
  return (
    <div className="container py-10 md:py-16">
      <h1 className="mb-6 text-3xl font-bold md:text-4xl">Доставка і оплата</h1>

      <Tabs defaultValue="delivery" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="delivery">Доставка</TabsTrigger>
          <TabsTrigger value="payment">Оплата</TabsTrigger>
        </TabsList>

        <TabsContent value="delivery" className="mt-6 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="16" x="4" y="4" rx="2" />
                    <path d="M9 9h6v6H9z" />
                    <path d="M15 4v2" />
                    <path d="M15 18v2" />
                    <path d="M4 15h2" />
                    <path d="M18 15h2" />
                    <path d="M4 9h2" />
                    <path d="M18 9h2" />
                    <path d="M9 4v2" />
                    <path d="M9 18v2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Самовивіз</h3>
              </div>
              <p className="text-muted-foreground">
                Ви можете забрати замовлення самостійно з нашого магазину за адресою: місто Бердичів, вулиця Чорновола, 8б
                Ми працюємо щодня з 10:00 до 20:00.
              </p>
              <div className="mt-4 rounded bg-muted px-3 py-2 text-sm">
                <span className="font-medium">Безкоштовно</span>
              </div>
            </div>

            <div className="rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m8 12 3 3 5-5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Кур'єром по місту</h3>
              </div>
              <p className="text-muted-foreground">
                Доставка кур'єром по Бердичеву здійснюється щодня з 11:00 до 21:00.
                Час доставки узгоджується з менеджером при підтвердженні замовлення.
              </p>
              <div className="mt-4 rounded bg-muted px-3 py-2 text-sm">
                <span className="font-medium">100 грн</span> (безкоштовно при замовленні від 1000 грн)
              </div>
            </div>

            <div className="rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="12" x="4" y="6" rx="2" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M10 12v.01" />
                    <path d="M14 12v.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Нова Пошта</h3>
              </div>
              <p className="text-muted-foreground">
                Доставка у відділення або поштомат Нової Пошти по всій Україні.
                Термін доставки: 1-3 дні з моменту відправки.
              </p>
              <div className="mt-4 rounded bg-muted px-3 py-2 text-sm">
                Згідно тарифів перевізника
              </div>
            </div>

            <div className="rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="13" x="4" y="5" rx="2" />
                    <path d="M16 2v6m0 0 3-3m-3 3-3-3" />
                    <path d="M8 22v-6m0 0 3 3m-3-3-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Укрпошта</h3>
              </div>
              <p className="text-muted-foreground">
                Доставка Укрпоштою по всій території України.
                Термін доставки: 3-5 днів з моменту відправки.
              </p>
              <div className="mt-4 rounded bg-muted px-3 py-2 text-sm">
                Згідно тарифів перевізника
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="mb-2 font-semibold">Важлива інформація:</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Доставка повітряних кульок з гелієм можлива тільки кур'єром по місту</li>
              <li>При замовленні великих композицій термін доставки може бути змінено</li>
              <li>Відстежувати статус замовлення можна в особистому кабінеті</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-6 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Оплата карткою онлайн</h3>
              </div>
              <p className="text-muted-foreground">
                Оплата банківською картою Visa або MasterCard через захищений платіжний шлюз.
                Кошти списуються відразу після підтвердження замовлення.
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
                    <path d="M20 14V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
                    <path d="M12 4v10" />
                    <path d="M2 14h20" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Оплата при отриманні</h3>
              </div>
              <p className="text-muted-foreground">
                Ви можете оплатити замовлення при отриманні готівкою або карткою 
                (для доставки кур'єром або при самовивозі).
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 10 2 2 4-4" />
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Переказ на картку</h3>
              </div>
              <p className="text-muted-foreground">
                Після оформлення замовлення вам будуть надіслані реквізити для оплати.
                Замовлення обробляється після підтвердження оплати.
              </p>
            </div>

            <div className="rounded-lg border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v1" />
                    <path d="M8 4H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
                    <path d="M22 12.5V6a2 2 0 0 0-2-2h-7.2a2 2 0 0 0-1.4.6l-3.8 3.8a2 2 0 0 0-.6 1.4V20a2 2 0 0 0 2 2h3.5" />
                    <path d="M18 14v6" />
                    <path d="M15 17h6" />
                    <path d="M7 10h3v3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Безготівковий розрахунок</h3>
              </div>
              <p className="text-muted-foreground">
                Для юридичних осіб доступна оплата за рахунком-фактурою з ПДВ.
                Замовлення обробляється після надходження коштів.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="mb-2 font-semibold">Важлива інформація:</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Для замовлень з доставкою по Україні потрібна передоплата</li>
              <li>При оплаті онлайн можливі додаткові комісії платіжних систем</li>
              <li>Для великих оптових замовлень можливі індивідуальні умови оплати</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Delivery;
