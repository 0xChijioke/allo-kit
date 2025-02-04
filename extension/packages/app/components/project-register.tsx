"use client";
import { type z } from "zod";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Address,
  generatePrivateKey,
  privateKeyToAccount,
} from "viem/accounts";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { CreateProjectSchema } from "~/schemas/project";
import { useRegister } from "~/hooks/use-register";
import { useIpfsUpload } from "~/hooks/use-ipfs-upload";
import { BalanceCheck } from "./balance-check";
import { ImageUpload } from "./image-upload";

export function ProjectRegister({
  strategyAddress,
}: {
  strategyAddress: Address;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof CreateProjectSchema>>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      address: privateKeyToAccount(generatePrivateKey()).address,
      metadata: {
        title: "Grant Project",
        image: undefined,
        description: `This is a project...`,
      },
    },
  });

  const register = useRegister({ strategyAddress });
  const upload = useIpfsUpload();

  const isLoading = upload.isPending || register.isPending;
  return (
    <Form {...form}>
      <form
        className="relative space-y-2 mx-auto max-w-screen-sm"
        onSubmit={form.handleSubmit(async (values) => {
          const { cid: metadata } = await upload.mutateAsync(values.metadata);
          register
            .mutateAsync([values.address, metadata, "0x"])
            .then((r) => router.push(`/project/${r.project}`));
        })}
      >
        <FormField
          control={form.control}
          name="metadata.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grant name</FormLabel>
              <FormControl>
                <Input autoFocus placeholder="Grant #1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metadata.image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageUpload {...field} upload={upload} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payout address</FormLabel>
              <FormControl>
                <Input autoFocus placeholder="0x..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metadata.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={8} placeholder={"..."} {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>Markdown is supported</FormDescription>
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end">
          <BalanceCheck>
            <Button isLoading={isLoading} type="submit">
              Create Project
            </Button>
          </BalanceCheck>
        </div>
      </form>
    </Form>
  );
}
