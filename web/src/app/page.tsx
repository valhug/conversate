import Link from "next/link"
import { Button, Card, CardHeader, CardContent, CardTitle } from "@conversate/ui"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Learn Languages Through{" "}
            <span className="text-primary">Real Conversations</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Master new languages naturally by practicing with AI-powered conversation partners. 
            Build confidence, improve fluency, and learn practical communication skills.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/register">Start Learning Free</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/conversation">Try Conversation Practice</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Choose Conversate?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the most natural way to learn languages through interactive conversations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">🗣️ Natural Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Practice real-world scenarios with AI partners that adapt to your skill level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">📈 Personalized Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get customized lessons based on your progress, goals, and interests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">🎯 Instant Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Receive immediate corrections and suggestions to improve your fluency
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Your Language Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of learners who are already improving their language skills with Conversate
          </p>
          <Button asChild size="lg">
            <Link href="/auth/register">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
