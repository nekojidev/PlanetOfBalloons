import { Link } from "react-router-dom"
import { FaFacebook, FaInstagram, FaTelegram } from "react-icons/fa"
import { MdEmail } from "react-icons/md"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container py-10 md:py-16">
        {/* Top section with logo and newsletter */}


        {/* Main footer links */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 md:grid-cols-3">
          <div className=" space-y-4">
            <h3 className="text-lg font-medium">Про нас</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                  Про компанію
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="text-muted-foreground transition-colors hover:text-foreground">
                  Доставка і оплата
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="text-muted-foreground transition-colors hover:text-foreground">
                  Контакти
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Навігація</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
                  Головна
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground transition-colors hover:text-foreground">
                  Товари
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="text-muted-foreground transition-colors hover:text-foreground">
                  Акції
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-muted-foreground transition-colors hover:text-foreground">
                  Оголошення
                </Link>
              </li>
            </ul>
          </div>

          {/* <div className="space-y-4">
            <h3 className="text-lg font-medium">Обліковий запис</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">
                  Увійти
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground transition-colors hover:text-foreground">
                  Реєстрація
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground transition-colors hover:text-foreground">
                  Профіль
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-muted-foreground transition-colors hover:text-foreground">
                  Мої замовлення
                </Link>
              </li>
            </ul>
          </div> */}

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Контакти</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <a href="tel:+380969794344" className="text-muted-foreground transition-colors hover:text-foreground">
                  +380 969 794 344
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MdEmail className="text-primary" />
                info@planetballoons.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                м. Бердичів, вул. Чорновола, 8б
              </li>
            </ul>
          </div>
        </div>

        {/* Social media and copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t pt-8 sm:flex-row">
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
               className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-white">
              <FaFacebook size={18} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
               className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-white">
              <FaInstagram size={18} />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" 
               className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-white">
              <FaTelegram size={18} />
            </a>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} Планета Кульок. Усі права захищено.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

