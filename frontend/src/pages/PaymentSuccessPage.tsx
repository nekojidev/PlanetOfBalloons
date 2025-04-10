// In /frontend/src/pages/PaymentSuccessPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<null | { _id: string; paymentStatus: string; status: string; totalPrice: number; orderItems: { image: string; name: string; amount: number; price: number; }[] }>(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (orderId) {
          const response = await axios.get(`/orders/${orderId}`);
          setOrder(response.data.order);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg">Завантаження деталей замовлення...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Оплата успішна!</CardTitle>
          <CardDescription>
            Дякуємо за ваше замовлення в Planet of Balloons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {order ? (
            <div className="space-y-4">
              <p className="font-medium">Номер замовлення: <span className="font-bold">{order._id}</span></p>
              <p>Статус платежу: <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{order.paymentStatus}</span></p>
              <p>Статус замовлення: <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{order.status}</span></p>
              <p className="font-medium">Сума до сплати: <span className="font-bold">{order.totalPrice.toFixed(2)} ₴</span></p>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Товари в замовленні:</h3>
                <ul className="space-y-2">
                  {order.orderItems.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-10 w-10 object-cover rounded mr-3" 
                        />
                        <span>{item.name} x {item.amount}</span>
                      </div>
                      <span>{(item.price * item.amount).toFixed(2)} ₴</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Деталі замовлення недоступні</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild>
            <Link to="/orders">Мої замовлення</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Продовжити покупки</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;