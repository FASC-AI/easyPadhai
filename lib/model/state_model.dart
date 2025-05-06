class StateModel {
  bool? status;
  Pagination? pagination;
  Data? data;
  String? message;

  StateModel({this.status, this.pagination, this.data, this.message});

  StateModel.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    pagination = json['pagination'] != null
        ? new Pagination.fromJson(json['pagination'])
        : null;
    data = json['data'] != null ? new Data.fromJson(json['data']) : null;
    message = json['message'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['status'] = this.status;
    if (this.pagination != null) {
      data['pagination'] = this.pagination!.toJson();
    }
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    data['message'] = this.message;
    return data;
  }
}

class Pagination {
  int? totalCount;

  Pagination({this.totalCount});

  Pagination.fromJson(Map<String, dynamic> json) {
    totalCount = json['totalCount'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['totalCount'] = this.totalCount;
    return data;
  }
}

class Data {
  List<List1>? list;

  Data({this.list});

  Data.fromJson(Map<String, dynamic> json) {
    if (json['list'] != null) {
      list = <List1>[];
      json['list'].forEach((v) {
        list!.add(new List1.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.list != null) {
      data['list'] = this.list!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class List1 {
  Name? name;
  Name? shortName;
  String? sId;
  Country? country;
  String? lgd;
  String? createdBy;
  String? updatedBy;
  bool? isActive;
  String? createdAt;
  String? updatedAt;
  String? code;
  int? iV;
  String? id;

  List1(
      {this.name,
      this.shortName,
      this.sId,
      this.country,
      this.lgd,
      this.createdBy,
      this.updatedBy,
      this.isActive,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV,
      this.id});

  List1.fromJson(Map<String, dynamic> json) {
    name = json['name'] != null ? new Name.fromJson(json['name']) : null;
    shortName =
        json['shortName'] != null ? new Name.fromJson(json['shortName']) : null;
    sId = json['_id'];
    country =
        json['country'] != null ? new Country.fromJson(json['country']) : null;
    lgd = json['lgd'];
    createdBy = json['createdBy'];
    updatedBy = json['updatedBy'];
    isActive = json['isActive'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    if (this.shortName != null) {
      data['shortName'] = this.shortName!.toJson();
    }
    data['_id'] = this.sId;
    if (this.country != null) {
      data['country'] = this.country!.toJson();
    }
    data['lgd'] = this.lgd;
    data['createdBy'] = this.createdBy;
    data['updatedBy'] = this.updatedBy;
    data['isActive'] = this.isActive;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}

class Name {
  String? english;
  String? hindi;

  Name({this.english, this.hindi});

  Name.fromJson(Map<String, dynamic> json) {
    english = json['english'];
    hindi = json['hindi'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['english'] = this.english;
    data['hindi'] = this.hindi;
    return data;
  }
}

class Country {
  Name? name;
  Name? shortName;
  String? sId;
  String? createdBy;
  String? updatedBy;
  bool? isActive;
  String? createdAt;
  String? updatedAt;
  String? code;
  int? iV;
  String? id;

  Country(
      {this.name,
      this.shortName,
      this.sId,
      this.createdBy,
      this.updatedBy,
      this.isActive,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV,
      this.id});

  Country.fromJson(Map<String, dynamic> json) {
    name = json['name'] != null ? new Name.fromJson(json['name']) : null;
    shortName =
        json['shortName'] != null ? new Name.fromJson(json['shortName']) : null;
    sId = json['_id'];
    createdBy = json['createdBy'];
    updatedBy = json['updatedBy'];
    isActive = json['isActive'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.name != null) {
      data['name'] = this.name!.toJson();
    }
    if (this.shortName != null) {
      data['shortName'] = this.shortName!.toJson();
    }
    data['_id'] = this.sId;
    data['createdBy'] = this.createdBy;
    data['updatedBy'] = this.updatedBy;
    data['isActive'] = this.isActive;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}
