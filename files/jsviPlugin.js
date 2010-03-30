/***
|''Name:''|jsviPlugin|
|''Description:''|vi-like editor for TiddlyWiki using jsvi.|
|''Version:''|0.1|
|''Date:''|March 29, 2010|
|''Source:''|http://github.com/peplin/jsvi-tiddly|
|''Author:''|Christopher Peplin|
|''License:''|[[Apache License, Version 2.0|License]]|
|''~CoreVersion:''|2.2.0|
|''Browser:''|Firefox 3.5+, Chromium 5.0+; others|
!Configuration options :
|jsvi folder (absolute or relative)|<<option txtjsviPath>> |
!Code
***/
//{{{
config.options.txtjsviPath = 
        config.options.txtjsviPath ? config.options.txtjsviPath : "jsvi/";
config.options.txtjsviHeight = 
        config.options.txtjsviHeight ? config.options.txtjsviHeight : "500px";

config.macros.editJsvi = {
    handler : function(place,macroName,params,wikifier,paramString,tiddler) {
        var field = params[0];
        var height = params[1] ? params[1] : config.options.txtjsviHeight;
        if (typeof jsvi == "undefined"){
            displayMessage(config.macros.editJsvi.jsviUnavailable);
            config.macros.edit.handler(
                    place, macroName, params, wikifier, paramString, tiddler);
        } else if (field) {
            var e = createTiddlyElement(null,"div");
            var jsviName = "jsvi" + Math.random();
            e.setAttribute("jsviName",jsviName);
            e.setAttribute("editJsvi",field);
            if(tiddler.isReadOnly()) {
                e.setAttribute("readOnly","readOnly");
            }
            if (height) {
                e.setAttribute("height",height);
            }
            place.appendChild(e);

            // TODO Need to modify jsvi to support use like this
            var editor = new jsvi(jsviName); 
            editor.BasePath = config.options.txtjsviPath;
            editor.Height = height;

            var re = /^<html>(.*)<\/html>$/m;
            var fieldValue = store.getValue(tiddler, field);
            var htmlValue = re.exec(fieldValue);
            var value = (htmlValue && (htmlValue.length > 0)) ?
                    htmlValue[1] : fieldValue;
            value = value.replace(/\[\[([^|\]]*)\|([^\]]*)]]/g,
                    '<a href="#$2">$1</a>');
            config.macros.editJsvi.jsviValues[jsviName]=value;

            // TODO modify jsvi to support this
            e.innerHTML = editor.CreateHtml();
        }
    },
    gather : function(e) {
        var name = e.getAttribute("jsviName");
        // TODO modify jsvi to support this
        var oEditor = window.jsviAPI ? jsviAPI.GetInstance(name) : null;
        if (oEditor) {
            var html = oEditor.GetHTML();
            if (html !== null)  {
                return "<html>" + 
                    html.replace(/<a href="#([^>]*)">([^<]*)<\/a>/gi,
                    "[[$2|$1]]") + "</html>"; 
            }
        }   
    },
    jsviValues : {},
    jsviUnavailable : "jsvi unavailable. Check configuration and reload."
};

window.jsvi_OnComplete = function(editorInstance) {
    var name = editorInstance.Name;
    var value = config.macros.editJsvi.jsviValues[name];
    delete config.macros.editJsvi.jsviValues[name];
    oEditor = jsviAPI.GetInstance(name);
    if (value) {
        oEditor.SetHTML(value);
    }
};

// to avoid looping if this line is called several times
Story.prototype.previousGatherSaveEditJsvi = 
        Story.prototype.previousGatherSaveEditJsvi ?
        Story.prototype.previousGatherSaveEditJsvi :
        Story.prototype.gatherSaveFields;

Story.prototype.gatherSaveFields = function(e,fields){
    if(e && e.getAttribute) {
        var f = e.getAttribute("editJsvi");
        if (f) {
            var newVal = config.macros.editJsvi.gather(e);
            if (newVal)  {
                fields[f] = newVal;
            }
        }
        this.previousGatherSaveEditJsvi(e, fields);
    }
};

config.shadowTiddlers.EditJsviTemplate = 
        config.shadowTiddlers.EditTemplate.replace(
                /macro='edit text'/, "macro='editJsvi text'");

config.commands.editJsvi = {
    text: "vi",
    tooltip: "Edit this tiddler with jsvi",
    readOnlyText: "",
    handler : function(event,src,title) {
        clearMessage();
        var tiddlerElem = document.getElementById(story.idPrefix + title);
        var fields = tiddlerElem.getAttribute("tiddlyFields");
        story.displayTiddler(null,title,"EditJsviTemplate",false,null,fields);
        return false;
    }
};

config.shadowTiddlers.ViewTemplate = 
        config.shadowTiddlers.ViewTemplate.replace(
        /\+editTiddler/, "+editTiddler editJsvi");

//}}}
