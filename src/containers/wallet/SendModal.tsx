import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/mediaQuery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightIcon, QrCodeIcon, SearchIcon } from "lucide-react";
import { useSendStore } from "@/state/send/state";
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes";
import ProfileRow from "@/components/profiles/ProfileRow";
import { getEmptyProfile, useProfilesStore } from "@/state/profiles/state";
import { ConfigToken, Profile } from "@citizenwallet/sdk";
import { useState } from "react";
import { useSendLogic } from "@/state/send/logic";

interface SendModalProps {
  token: ConfigToken;
  children: React.ReactNode;
}

export default function SendModal({ token, children }: SendModalProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [sendStore, actions] = useSendLogic();

  const resolvedTo = sendStore((state) => state.resolvedTo);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      setTimeout(() => {
        actions.clear();
      }, 500);
    }
  };

  const handleCancelToSelection = () => {
    actions.cancelToSelection();
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when youre done.
            </DialogDescription>
          </DialogHeader>
          <SendForm token={token} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Send</DrawerTitle>
        </DrawerHeader>
        <SendForm token={token} className="px-4" />
        <DrawerFooter className="pt-2">
          {!resolvedTo ? (
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          ) : (
            <Button onClick={handleCancelToSelection} variant="outline">
              Back
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

interface SendFormProps {
  token: ConfigToken;
  className?: string;
}

const SendForm = ({ token, className }: SendFormProps) => {
  const divHeight =
    (typeof window !== "undefined" ? window.innerHeight : 200) * (5 / 6);

  console.log("divHeight", divHeight);

  const [sendStore, actions] = useSendLogic();

  const to = sendStore((state) => state.to);
  const resolvedTo = sendStore((state) => state.resolvedTo);
  const profiles = useProfilesStore((state) => state.profiles);

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const to = e.target.value;
    // updateTo(to);
  };

  const handleProfileSelect = (profile: Profile) => {
    // updateTo(profile.account);
    console.log(profile);
    actions.updateResolvedTo(profile.account);
  };

  let modalContent = (
    <Box key="to" className="animate-fadeIn h-full w-full">
      <Box className="relative w-full h-14 mb-4">
        <Input
          type="search"
          id="search"
          autoFocus
          placeholder="Search user of paste address"
          className="border-primary border-2 rounded-full pl-5 pr-5 w-full h-14 text-base"
          value={to}
          onChange={handleToChange}
        />
        <SearchIcon className="text-primary absolute top-4 right-4" />
      </Box>

      <Flex className="w-full h-10">
        <Button variant="ghost" className="flex justify-start w-full">
          <QrCodeIcon size={24} className="text-primary mr-4" />
          <Text>Scan QR Code</Text>
        </Button>
      </Flex>
      <Flex
        direction="column"
        className="w-full gap-4"
        style={{ height: divHeight - 250 }}
      >
        <ScrollArea className="w-full">
          <Box className="z-10 absolute top-0 left-0 bg-transparent-to-white h-10 w-full"></Box>
          <Box className="h-4"></Box>
          <Box>
            {Object.values(profiles).map((profile) => (
              <ProfileRow
                key={profile.account}
                profile={profile}
                onSelect={handleProfileSelect}
              />
            ))}
          </Box>
          <Box className="h-4"></Box>
          <Box className="z-10 absolute bottom-0 left-0 w-full bg-transparent-from-white h-10 w-full"></Box>
        </ScrollArea>
      </Flex>
    </Box>
  );

  if (resolvedTo) {
    const profile = profiles[resolvedTo] ?? getEmptyProfile(resolvedTo);

    modalContent = (
      <Box key="amount" className="animate-fadeIn h-full w-full">
        <Flex justify="center" align="center" className="w-full">
          <ProfileRow fullWidth={false} profile={profile} />
        </Flex>

        <Flex align="center" className="relative w-full h-14 pl-10 pr-10">
          <Text>Send</Text>
          <Input
            type="text"
            id="amount"
            autoFocus
            placeholder="0.00"
            className="text-primary border-primary border-0 rounded-none border-b-2 ml-2 mr-2 pl-5 pr-5 w-full h-14 text-4xl text-center"
            value={to}
            onChange={handleToChange}
          />
          <Text size="6" weight="bold" className="font-bold">
            {token.symbol}
          </Text>
        </Flex>
        <Flex justify="center" align="center" className="w-full">
          <Text>Current Balance: 0.00 {token.symbol}</Text>
        </Flex>
        <Flex justify="center" align="center" className="w-full mt-10">
          <Button className="w-full">
            Send
            <ArrowRightIcon size={24} className="ml-4" />
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Flex
      direction="column"
      className={cn(
        "w-full items-start gap-4 overflow-hidden",
        !resolvedTo ? "h-5/6" : "",
        className
      )}
    >
      {modalContent}
    </Flex>
  );
};