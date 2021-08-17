<script lang="ts">
  import TextField from "smelte/src/components/TextField";
  import Button from "smelte/src/components/Button";

  let form = {
    mac: {
      error: "Please enter a valid MAC address",
      pattern: /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/,
      valid: true
    }
  }

  type Form = typeof form;

  function valid (e: Event) {
    const inputHtml = e.target as HTMLInputElement;
    const name = inputHtml.name as keyof Form;
    const value = inputHtml.value;
    const input = form[name];

    input.valid = input.pattern.test(value);

    console.log(input.valid);

    form = form;
  }
</script>

<h4>Create Beacons</h4>
<form action="#" >
  <TextField
    name="mac"
    label="Mac"
    error={form.mac.valid ? "" : form.mac.error}
    require
    on:input={valid}
  />
  <TextField name="name" label="Name" require />
  <TextField type="number" label="TSSI" require />
  <TextField type="number" label="Channel" require />
  <Button type="submit" block>Create</Button>
</form>