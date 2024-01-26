const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        if (newMember.id == "429307989011202048") {
            if (newMember.nickname == "faux titouan (la ptite soumise)") {
                return
            }
            newMember.setNickname("faux titouan (la ptite soumise)")
            return
        }
    
        if (newMember.id == "766693700050878504") {
            if (newMember.nickname == "cyprine le voleur de vannes") {
                return
            }
            newMember.setNickname("cyprine le voleur de vannes")
            return
        }
    },
};