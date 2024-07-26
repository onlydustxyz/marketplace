import { components } from "src/__generated/api";

type UserProfileResponse = components["schemas"]["PrivateUserProfileResponse"];

export enum UserProfileContactChannel {
  Discord = "DISCORD",
  Email = "EMAIL",
  LinkedIn = "LINKEDIN",
  Telegram = "TELEGRAM",
  Twitter = "TWITTER",
  Whatsapp = "WHATSAPP",
}

export interface UserProfileInterface extends UserProfileResponse {
  hasContact(channel: UserProfileContactChannel): boolean;
  getContact(channel: UserProfileContactChannel):
    | {
        channel: `${UserProfileContactChannel}`;
        contact?: string;
        visibility: "public" | "private";
      }
    | undefined;
  setContact(params: { channel: UserProfileContactChannel; contact: string; visibility?: "public" | "private" }): void;
}

export class UserProfile implements UserProfileInterface {
  allocatedTimeToContribute!: UserProfileResponse["allocatedTimeToContribute"];
  avatarUrl!: UserProfileResponse["avatarUrl"];
  bio!: UserProfileResponse["bio"];
  contacts!: UserProfileResponse["contacts"];
  firstName!: UserProfileResponse["firstName"];
  githubUserId!: UserProfileResponse["githubUserId"];
  id!: UserProfileResponse["id"];
  isLookingForAJob!: UserProfileResponse["isLookingForAJob"];
  lastName!: UserProfileResponse["lastName"];
  location!: UserProfileResponse["location"];
  login!: UserProfileResponse["login"];
  technologies!: UserProfileResponse["technologies"];
  website!: UserProfileResponse["website"];

  constructor(props: UserProfileResponse) {
    Object.assign(this, props);
  }

  hasContact(channel: UserProfileContactChannel) {
    return this.contacts?.some(c => c.channel === channel && c.contact) ?? false;
  }

  getContact(channel: UserProfileContactChannel) {
    return this.contacts?.find(c => c.channel === channel && c.contact);
  }

  private sanitizeChannelContact(contact: string) {
    let sanitizedContact = contact;

    if (contact.endsWith("/")) {
      sanitizedContact = sanitizedContact.slice(0, -1);
    }

    if (contact.includes("/")) {
      sanitizedContact = sanitizedContact.split("/").at(-1) ?? "";
    }

    if (contact.startsWith("@")) {
      sanitizedContact = sanitizedContact.substring(1);
    }

    return sanitizedContact;
  }

  setContact({
    channel,
    contact,
    visibility = "private",
  }: {
    channel: UserProfileContactChannel;
    contact: string;
    visibility?: "public" | "private";
  }) {
    this.contacts = this.contacts?.map(c =>
      c.channel === channel ? { ...c, contact: this.sanitizeChannelContact(contact), visibility } : c
    );
  }
}
