import { UseGetMyProfileInfoResponse } from "src/api/me/queries";

import { TProfileForm } from "./form.types";

export function sanitizeContactHandle(contact: string) {
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

export function createContact({
  channel,
  contact,
  isPublic,
  prefixUrl,
}: TProfileForm.CreateContactProps): TProfileForm.Contact {
  return {
    channel,
    contact: contact ? `${prefixUrl || ""}${sanitizeContactHandle(contact)}` : "",
    visibility: isPublic ? "public" : "private",
  };
}

export function formatToData(data: UseGetMyProfileInfoResponse): TProfileForm.Data {
  const { avatarUrl, cover, location, bio, website, contacts, technologies, allocatedTimeToContribute } = data;

  function getContactInfo(contact: TProfileForm.Contact["channel"]) {
    const contactInfo = contacts?.find(contactInfo => contactInfo.channel === contact);

    return {
      contact: sanitizeContactHandle(contactInfo?.contact ?? ""),
      isPublic: contactInfo?.visibility === "public",
    };
  }

  return {
    avatarUrl: avatarUrl ?? "",
    cover: cover ?? "BLUE",
    location: location ?? "",
    bio: bio ?? "",
    website: website ?? "",
    telegram: getContactInfo("TELEGRAM"),
    whatsapp: getContactInfo("WHATSAPP"),
    twitter: getContactInfo("TWITTER"),
    discord: getContactInfo("DISCORD"),
    linkedin: getContactInfo("LINKEDIN"),
    technologies: technologies ?? {},
    weeklyAllocatedTime: allocatedTimeToContribute ?? TProfileForm.ALLOCATED_TIME.NONE,
    lookingForAJob: data.isLookingForAJob ?? false,
  };
}

export function formatToSchema(data: TProfileForm.Data) {
  return {
    avatarUrl: data.avatarUrl,
    cover: data.cover,
    location: data.location,
    bio: data.bio,
    website: data.website,
    contacts: [
      createContact({
        channel: "TELEGRAM",
        contact: data.telegram.contact,
        isPublic: data.telegram.isPublic,
        prefixUrl: "https://t.me/",
      }),
      createContact({
        channel: "WHATSAPP",
        contact: data.whatsapp.contact,
        isPublic: data.whatsapp.isPublic,
      }),
      createContact({
        channel: "TWITTER",
        contact: data.twitter.contact,
        isPublic: data.twitter.isPublic,
        prefixUrl: "https://x.com/",
      }),
      createContact({
        channel: "DISCORD",
        contact: data.discord.contact,
        isPublic: data.discord.isPublic,
      }),
      createContact({
        channel: "LINKEDIN",
        contact: data.linkedin.contact,
        isPublic: data.linkedin.isPublic,
        prefixUrl: "https://www.linkedin.com/in/",
      }),
    ],
    technologies: data.technologies,
    allocatedTimeToContribute: data.weeklyAllocatedTime,
    isLookingForAJob: data.lookingForAJob,
  };
}