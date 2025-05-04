import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { ScrollShadow } from "@heroui/scroll-shadow";
export const dynamic = "force-dynamic";

import Form from "@/components/form";
export default async function Home() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const { usernames }: { usernames: string[] } = await fetch(
    url + "/api/usernames"
  ).then((res) => res.json());

  return (
    <section className="flex md:flex-row flex-col gap-4 flex-grow">
      <div className="w-full md:w-1/2">
        <Form />
      </div>
      <Divider orientation="vertical" />
      <Card className="w-full md:w-1/2 min-h-76">
        <CardHeader className="text-xl font-bold">
          List of usernames in database
        </CardHeader>
        <CardBody>
          <ScrollShadow hideScrollBar className="h-52 px-10">
            <ul className="list-disc italic">
              {usernames.map((username) => (
                <li key={username}>{username}</li>
              ))}
            </ul>
          </ScrollShadow>
        </CardBody>
      </Card>
    </section>
  );
}
