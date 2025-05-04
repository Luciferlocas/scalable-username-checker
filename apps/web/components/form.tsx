"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";

import { checkUsernameAction, createUsernameAction } from "@/actions/username";
import { CreateUsernameResponse, Response } from "@/types";

export default function UsernameForm() {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [response, setResponse] = useState<Response | null>(null);
  const [createResponse, setCreateResponse] =
    useState<CreateUsernameResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckUsername = async () => {
    if (!username || !username.trim()) {
      setError("Username is required");

      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      setError("Invalid username format");

      return;
    }

    setIsChecking(true);
    try {
      const data = await checkUsernameAction(username);

      setCreateResponse(null);
      setResponse(data);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreateUsername = async () => {
    if (!username || !username.trim()) {
      setError("Username is required");

      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      setError("Invalid username format");

      return;
    }

    setIsCreating(true);
    try {
      const data = await createUsernameAction(username);

      setResponse(null);
      setCreateResponse(data);
    } catch (error) {
      console.error("Error creating username:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-xl font-bold">Username Checker</CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              isRequired
              errorMessage={error}
              id="username"
              isInvalid={!!error}
              label="Username"
              labelPlacement="outside"
              placeholder="Enter a username"
              value={username}
              onChange={(e) => {
                setError(null);
                setUsername(e.target.value);
              }}
            />
            <p className="text-xs text-zinc-500">
              Username must be 3-20 characters and contain only letters,
              numbers, underscores, and hyphens.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1"
              color="primary"
              disabled={isChecking}
              isLoading={isChecking}
              onPress={handleCheckUsername}
            >
              Check Username
            </Button>

            <Button
              className="flex-1"
              color="primary"
              disabled={isCreating}
              isLoading={isCreating}
              onPress={handleCreateUsername}
            >
              Create Username
            </Button>
          </div>
        </div>
        {response ? (
          <CardFooter className="border-t-1 mt-6 border-gray-600 w-full flex flex-col gap-4 items-start">
            <div className="flex md:flex-row flex-col justify-between gap-2 w-full">
              <p className="text-sm">
                Username{" "}
                <span
                  className={
                    response.available ? "text-blue-500" : "text-red-500"
                  }
                >
                  {response?.username}
                </span>{" "}
                <span className="text-muted-foreground">
                  {response?.available ? "is available!" : "is not available!"}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Checked in{" "}
                <span className="text-blue-500">
                  {response?.checkTimeMs}ms using {response?.source}
                </span>
              </p>
            </div>
            {response?.suggestions && (
              <div className="flex flex-wrap gap-4">
                <p className="text-sm">Suggestions:</p>
                {response.suggestions.map((suggestion) => (
                  <Chip key={suggestion} color="primary" size="sm">
                    {suggestion}
                  </Chip>
                ))}
              </div>
            )}
          </CardFooter>
        ) : createResponse ? (
          <CardFooter className="border-t-1 mt-6 border-gray-600 w-full">
            <p
              className={`${createResponse.success ? "text-blue-500" : "text-red-500"} text-center w-full text-sm`}
            >
              {createResponse?.message}
            </p>
          </CardFooter>
        ) : (
          <CardFooter className="border-t-1 mt-6 border-gray-600 w-full">
            <p className="text-center w-full text-sm italic text-gray-500">
              Enter a username to check if it&apos;s available!
            </p>
          </CardFooter>
        )}
      </CardBody>
    </Card>
  );
}
