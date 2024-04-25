import { faker } from "@faker-js/faker";

export const generateRandomUsername = (name: string): string => {
    const [firstName, lastName] = name.split(" ");
    return faker.internet.userName({
        firstName,
        lastName,
    })
};