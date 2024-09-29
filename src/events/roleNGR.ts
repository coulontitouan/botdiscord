import { Events, GuildMember, PermissionFlagsBits, PermissionsBitField } from 'discord.js';

export default {
    name: Events.GuildMemberUpdate,
    async execute(oldMember: GuildMember, newMember: GuildMember) {
        const tag = "NGR | ";
        const idRoleNGR = '1104446622043209738';
        let conditionAncienNom = oldMember.nickname !== null ? oldMember.nickname.startsWith(tag) : false
        let conditionNouveauNom = newMember.nickname !== null ? newMember.nickname.startsWith(tag) : false
        
        // Si l'ancien membre n'a pas le rôle NGR et que le nouveau membre a le rôle NGR et que son nom ne commence pas par NGR
        if (!(oldMember.roles.cache.has(idRoleNGR)) && newMember.roles.cache.has(idRoleNGR) && !conditionAncienNom) {
            // Si le nouveau membre n'a pas la permission administrateur
            if (!newMember.permissions.has(PermissionFlagsBits.Administrator)) {
                // Si le nouveau membre a un surnom
                if (newMember.nickname) {
                    // Si le surnom du nouveau membre est inférieur ou égal à 26 caractères
                    if (newMember.nickname.length <= 26) {
                        // Ajoute le tag NGR devant le surnom
                        newMember.setNickname(tag + newMember.nickname)
                    } else {
                        // Ajoute le tag NGR devant les 26 premiers caractères du surnom
                        newMember.setNickname(tag + newMember.nickname.slice(0, 26))
                    }
                }
                else {
                    // Si le nom du nouveau membre est inférieur ou égal à 26 caractères
                    if (newMember.user.username.length <= 26) {
                        // Ajoute le tag NGR devant le nom
                        newMember.setNickname(tag + newMember.displayName)
                    } else {
                        // Ajoute le tag NGR devant les 26 premiers caractères du nom
                        newMember.setNickname(tag + newMember.displayName.slice(0, 26))
                    }
                }
            }
        // Si l'ancien membre a le rôle NGR et que le nouveau membre n'a pas le rôle NGR
        } else if (oldMember.roles.cache.has(idRoleNGR) && !(newMember.roles.cache.has(idRoleNGR))) {
            // Si le nouveau membre n'a pas la permission administrateur et que son nom commence par NGR
            if (!newMember.permissions.has(PermissionFlagsBits.Administrator) && conditionNouveauNom) {
                const newNickname = (newMember.nickname as string).slice(tag.length);
                // On enlève le tag NGR du surnom
                newMember.setNickname(newNickname === newMember.displayName ? null : newNickname);
            }
        }

        if (!conditionAncienNom && conditionNouveauNom) {
            newMember.roles.add('1104446622043209738')
        } else if (conditionAncienNom && !conditionNouveauNom) {
            newMember.roles.remove('1104446622043209738')
        }
    },
};