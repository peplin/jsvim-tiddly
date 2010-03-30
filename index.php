<?php
$p = new Plugin('jsvi Plugin','0.1','github.com/peplin/jsvi-tiddly')

$p->addTiddler($data1, getcwd().'/plugins/jsvi/files/ToolbarCommands.tid');
$p->addTiddler($data1, getcwd().'/plugins/jsvi/files/MarkupPreHead.tid');
$data1['tags'] = 'systemConfig';
$p->addTiddler($data1, getcwd().'/plugins/jsvi/files/jsviPlugin.js');
$p->addTiddler($data1, getcwd().'/plugins/jsvi/files/jsviSettings.js');
?>
