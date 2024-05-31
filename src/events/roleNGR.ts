const { Events, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        let conditionAncienNom, conditionNouveauNom

        if (oldMember.nickname != null) {
            conditionAncienNom = oldMember.nickname.startsWith('NGR | ')
        } else {
            conditionAncienNom = false
        }

        if (newMember.nickname != null) {
            conditionNouveauNom = newMember.nickname.startsWith('NGR | ')
        } else {
            conditionNouveauNom = false
        }

        if (!(oldMember._roles.includes('1104446622043209738')) && newMember._roles.includes('1104446622043209738') && !conditionAncienNom) {
            if (!newMember.permissions.has([PermissionsBitField.Flags.Administrator])) {
                if (newMember.nickname != null) {
                    if (newMember.nickname.length <= 26) {
                        newMember.setNickname('NGR | ' + newMember.nickname)
                    } else {
                        newMember.setNickname('NGR | ' + newMember.nickname.slice(0, 26))
                    }
                }
                else if (newMember.user.username.length <= 26) {
                    newMember.setNickname('NGR | ' + newMember.user.username)
                } else {
                    newMember.setNickname('NGR | ' + newMember.user.username.slice(0, 26))
                }
            }
        } else if (oldMember._roles.includes('1104446622043209738') && !(newMember._roles.includes('1104446622043209738'))) {
            if (!newMember.permissions.has([PermissionsBitField.Flags.Administrator]) && conditionNouveauNom) {

                newMember.setNickname(newMember.nickname.slice(6))

                if (newMember.nickname.slice(6) === newMember.user.username || newMember.user.username.startsWith(newMember.nickname.slice(6))) {
                    newMember.setNickname("");
                }
            }
        }

        if (!conditionAncienNom && conditionNouveauNom) {
            newMember.roles.add('1104446622043209738')
        } else if (conditionAncienNom && !conditionNouveauNom) {
            newMember.roles.remove('1104446622043209738')
        }
    },
};