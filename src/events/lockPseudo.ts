import { GuildMember, Events } from 'discord.js';

export default {
    name: Events.GuildMemberUpdate,
    async execute(oldMember:GuildMember, newMember:GuildMember) {
        switch (newMember.id) {
            case "429307989011202048":
                if (newMember.nickname !== "faux titouan (la ptite soumise)") {
                    return newMember.setNickname("faux titouan (la ptite soumise)")
                }
                break;
            case "766693700050878504":
                if (newMember.nickname !== "cyprine le voleur de vannes") {
                    return newMember.setNickname("cyprine le voleur de vannes")
                }
                break;
        }
    },
};