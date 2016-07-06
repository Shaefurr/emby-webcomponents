﻿define(['./voicecommands.js', './grammarprocessor.js', 'require'], function (voicecommands, grammarprocessor, require) {

    var commandgroups;

    function getCommandGroups() {

        if (commandgroups) {
            return Promise.resolve(commandgroups);
        }

        return new Promise(function (resolve, reject) {

            var file = "grammar";

            require(['text!./grammar/' + file + '.json'], function (response) {
                commandgroups = JSON.parse(response);
                resolve(commandgroups);
            });
        });
    }
    /// <summary> Process the transcript described by text. </summary>
    /// <param name="text"> The text. </param>
    /// <returns> . </returns>
    function processTranscript(text) {
        if (text) {
            var processor = grammarprocessor(commandgroups, text);
            if (processor && processor.command) {
                console.log("Command from Grammar Processor", processor);
                return voicecommands(processor)
                    .then(function (result) {
                        console.log("Result of executed command", result);
                        if (result.item.actionid === 'show' && result.item.sourceid === 'group') {
                            return Promise.reject({ error: "group", item: result.item, groupName: result.name });
                        } else {
                            return Promise.resolve({ item: result.item });
                        }
                    }, function () {
                        return Promise.reject({ error: "unrecognized-command", text: text });
                    });
            } else {
                return Promise.reject({ error: "unrecognized-command", text: text });
            }

        } else {
            return Promise.reject({ error: "empty" });
        }
    }

    /// <summary> An enum constant representing the window. voice input manager option. </summary>
    return {
        processTranscript: processTranscript,
        getCommandGroups: getCommandGroups
    };

});