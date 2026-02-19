"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReviews } from "@/module/review";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, PlayCircle } from "lucide-react";

export default function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      return await getReviews();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-wide">Reviews </h1>
      <h3 className="text-muted-foreground mt-1 mb-5 text-base">
        Manage Your Reviews & Tasks Here
        <PlayCircle className="ml-2 inline h-4 w-4" />
      </h3>

      {reviews?.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground pt-5">
            No reviews found, Connect your repo and Open PR to get reviews
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5">
          {reviews?.map((review: any) => (
            <Card
              key={review.id}
              className="p-3 transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">
                      {review.repository.name}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {" "}
                      PR #{review.prNumber}
                    </p>
                  </div>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-light">{review.prTitle}</h2>
                      {review.status === "completed" && (
                        <Badge variant="default" className="gap-1 text-xs">
                          Completed
                        </Badge>
                      )}
                      {review.status === "failed" && (
                        <Badge variant="destructive" className="gap-1">
                          failed
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="-mt-2">
                <p className="text-muted-foreground mb-4 text-sm">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </p>

                {/* Replace the prose div with Message component */}
                <Message from="assistant" className="mb-4">
                  <MessageContent>
                    <MessageResponse>{review.review.substring(0, 400)}</MessageResponse>
                  </MessageContent>
                </Message>

                <Button variant="outline" className="text-xs" asChild>
                  <a
                    href={review?.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Full Review
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
