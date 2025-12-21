
import Link from "next/link";
import { Politician } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PoliticianCardProps {
  politician: Politician;
}

export function PoliticianCard({ politician }: PoliticianCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
          <AvatarImage src={politician.image} alt={politician.name} />
          <AvatarFallback>{politician.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="text-xl font-bold">{politician.name}</h3>
          <p className="text-sm text-muted-foreground">{politician.district}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="mb-4">
          <Badge 
            variant="outline" 
            className={`
              ${politician.party === "국민의힘" ? "text-red-600 border-red-200 bg-red-50" : ""}
              ${politician.party === "더불어민주당" ? "text-blue-600 border-blue-200 bg-blue-50" : ""}
              ${politician.party === "정의당" ? "text-yellow-600 border-yellow-200 bg-yellow-50" : ""}
            `}
          >
            {politician.party}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {politician.bio}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="secondary">
          <Link href={`/politicians/${politician.id}`}>
            상세보기
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
