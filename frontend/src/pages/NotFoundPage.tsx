import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

const NotFoundPage = () => {
  return (
    <div className="container flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Сторінку не знайдено</h2>
      <p className="text-muted-foreground max-w-md mb-8">Сторінка, яку ви шукаєте, не існує або була переміщена.</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/">На головну</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/products">Переглянути товари</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage

