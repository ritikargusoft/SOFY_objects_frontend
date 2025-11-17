<template>
  <div class="">
    <h4>Description</h4>
    <div class="d-flex flex-wrap mb-2 ga-2">
      <v-btn
        size="small"
        variant="text"
        :color="isActive('bold')"
        @click="cmd('toggleBold')"
      >
        <span class="material-symbols-outlined"> format_bold </span>
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        :color="isActive('italic')"
        @click="cmd('toggleItalic')"
      >
        <span class="material-symbols-outlined"> format_italic </span>
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        :color="isActive('underline')"
        @click="cmd('toggleUnderline')"
      >
        <span class="material-symbols-outlined"> format_underlined </span>
      </v-btn>
      <v-divider vertical class="mx-2" />
      <v-btn
        size="small"
        variant="text"
        :color="isActive('orderedList')"
        @click="cmd('toggleOrderedList')"
      >
        <span class="material-symbols-outlined"> format_list_numbered </span>
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        :color="isActive('bulletList')"
        @click="cmd('toggleBulletList')"
      >
        <span class="material-symbols-outlined"> format_list_bulleted </span>
      </v-btn>
      <v-divider vertical class="mx-2" />
      <v-btn
        size="small"
        variant="text"
        :color="isActiveAlign('left')"
        @click="align('left')"
      >
        <span class="material-symbols-outlined"> format_align_left </span>
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        :color="isActiveAlign('center')"
        @click="align('center')"
      >
        <span class="material-symbols-outlined"> format_align_center </span>
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        :color="isActiveAlign('right')"
        @click="align('right')"
      >
        <span class="material-symbols-outlined"> format_align_right </span>
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        :color="isActiveAlign('justify')"
        @click="align('justify')"
      >
        <span class="material-symbols-outlined"> format_align_justify </span>
      </v-btn>
    </div>
    <div
      class="editor border rounded px-10 py-3"
      :class="{ 'v-theme-light': true }"
    >
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<script setup>

import { onBeforeUnmount, watch, computed } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

const props = defineProps({
  modelValue: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);
const editor = new Editor({
  content: props.modelValue || "",
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ],
  onUpdate({ editor }) {
    const html = editor.getHTML();
    emit("update:modelValue", html);
  },
});

watch(
  () => props.modelValue,
  (val) => {
    if (val !== editor.getHTML()) editor.commands.setContent(val || "", false);
  }
);

onBeforeUnmount(() => editor.destroy());
function cmd(name) {
  editor.chain().focus()[name]().run();
}

function align(dir) {
  editor.chain().focus().setTextAlign(dir).run();
}

function isActive(name) {
  return editor?.isActive(name) ? "blue-lighten-1" : undefined;
}

function isActiveAlign(dir) {
  return editor?.isActive({ textAlign: dir }) ? "blue-lighten-1" : undefined;
}
</script>

<style scoped>
.editor :deep(.ProseMirror) {
  min-height: 140px;
  outline: none;
}
.border {
  border: 1px solid #e0e0e0;
}
.rounded {
  border-radius: 8px;
}
</style>
