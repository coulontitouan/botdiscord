import { Message, Events, GuildMember, PermissionFlagsBits } from 'discord.js';

export default {
    name: Events.MessageCreate,
    async execute(message:Message) {
        if (message.channelId === "1072205408938246173") {
            if ((message.content != "mdr" && message.content != "笑") || message.attachments.size > 0 || message.stickers.size > 0 || message.mentions.repliedUser != null || message.member === undefined ) {
                message.delete();
                const member = message.member as GuildMember;
                if (member) {
                    member.send("Le salon est drôle, il faut marquer mdr...");
                    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
                        member.timeout(60000, "il a pas dit mdr")
                    }
                }
            }
        }
    }
};