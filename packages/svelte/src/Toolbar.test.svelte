<script lang="ts">
  import { Editor, Toolbar } from "./index";

  export let exclude: string[] | undefined = undefined;
</script>

<Editor config={{ placeholder: "Start writing..." }}>
  <Toolbar {exclude} />
</Editor>
