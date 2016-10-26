require "rubygems"
require "pry"
require "json"
require "csv"

csv = CSV.read("bezirke_lor.csv", headers: true, header_converters: :symbol)

{
  Bezirk: %i[FULLKEY bezirk_key bezirk_name],
  Bezirksregion: %i[SCHLUESSEL bezirksregion_key bezirksregion_name],
  Planungsraum: %i[SCHLUESSEL kiez_key kiez_name]
}.each do |file, (json_key, csv_key, csv_name)|
  data = JSON.parse(File.read("lor_json/#{file}.json"), symbolize_names: true)
  features = data[:features].map do |feature|
    id = feature[:properties][json_key]
    row = csv.find { |r| r[csv_key] == id }
    unless row
      puts "warn: lor_json/#{file}.json could not find :#{json_key} = '#{id}' in :#{csv_key}"
      next
    end
    feature[:properties] = {
      id: row[csv_key],
      name: row[csv_name]
    }
    feature
  end
  data[:features] = features.compact
  File.open("lor_json/#{file}_annotated.geojson", "w") { |f| f.write(JSON.pretty_generate(data)) }
end

binding.pry

